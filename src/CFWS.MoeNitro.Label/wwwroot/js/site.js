// INIT 
var dbsamere = {
    //nodes: [
    //{
    //    host
    //    user
    //    pass
    //}
    //],
    //lastuser: {
    //    name: '',
    //    password : ''
    //}
    //lastcommand
};
var init = localStorage.getItem("dbsamere");
if (init) dbsamere = JSON.parse(init);
if (dbsamere.lastuser) {
    $("#username").val(dbsamere.lastuser.name);
    $("#password").val(dbsamere.lastuser.password);
}
if (dbsamere.lastcommand) {
    $("#command").val(dbsamere.lastcommand);
}

/* DECLARATION */
var ajr = function (url, data, cb) {
    $.ajax({
        method: "GET",
        url: url,
        data : data
    })
    .done(function (r) {
        if (!r.success) alert("Erreur\n\n" + r.data);

        cb(r.data)
    });

};
var addNode = function (node) {
    var newNode = $(".node-pattern").clone();
    newNode.removeClass("node-pattern");
    newNode.show();
    newNode.addClass("node");
    newNode.find(".name").text(node.name);
    newNode.find(".hostname").text(node.hostname);
    newNode.find(".username").text(node.user);
    newNode.find(".password").text(node.password);
    newNode.find(".suppressor").data("nodeId", node.id);
    newNode.find(".suppressor").click(function () {
        removeNode(this);
    });
    newNode.appendTo(".node-container");
    newNode.show();

    if (!dbsamere.nodes) dbsamere.nodes = [];
    dbsamere.nodes.push({
        name : node.name,
        host: node.hostname,
        user: node.user,
        pass: node.password
    });
    localStorage.setItem('dbsamere', JSON.stringify(dbsamere));
};

// Get All
var getAllNodes = function () {
    ajr("/data/getnodes", null, function (data) {
        $(".node-container").empty();
        dbsamere.nodes = [];
        $.each(data, function (k, v) {
            addNode(v);
        });
    });
};
// Add one
$("#creator").click(function () {
    $(this).prop("disable", true);
    var newName = $("#name").val();
    var newHost = $("#hostname").val();
    var newUser = $("#username").val();
    var newPass = $("#password").val();
    ajr("/data/addnode",
        {
            Name: newName,
            Hostname: newHost,
            User: newUser,
            Password: newPass
        },
        function (data) {
            getAllNodes();
            $(this).prop("disable", false);
        });
    if (!dbsamere.lastuser) dbsamere.lastuser = {};
    dbsamere.lastuser.name = newUser;
    dbsamere.lastuser.password = newPass;
    localStorage.setItem('dbsamere', JSON.stringify(dbsamere));
});
// Remove by id
var removeNode = function (btn) {
    $(btn).prop("disable", true);
    var removedId = $(btn).data("nodeId");
    ajr("/data/removenode/" + removedId, null,
        function (data) {
            getAllNodes();
            $(btn).prop("disable", false);
        });

};



// Tout commence ici
getAllNodes();

// Command one shot
$("#commander").click(function () {
    var command = $("#command").val();
    if (!command) {
        alert("où est ma commande ?");
        return false;
    }
    if (!dbsamere.nodes || dbsamere.nodes.length == 0) {
        alert("Aucun noeud à contacter");
        return false;
    }
    dbsamere.lastcommand = command;
    localStorage.setItem('dbsamere', JSON.stringify(dbsamere));
    $.each(dbsamere.nodes, function (k, v) {
        $.ajax({
            method: "GET",
            url: "/home/req",
            contentType: "application/json",
            data: {
                Host: v.host,
                Username: v.user,
                Password: v.pass,
                Command: command
            }
        })
        .done(function (r) {
            if (!r.success) alert("Erreur sur le noeud : " + v.host + "\n" + r.error);

            var newNode = $("<div>")
                .text(r.data)
                .appendTo(".output");
        });
    });
    return false;
});

// Exec command
var exec = function (node, command, cb) {
    $.ajax({
        method: "GET",
        url: "/home/req",
        contentType: "application/json",
        data: {
            Host: node.host,
            Username: node.username,
            Password: node.password,
            Command: command.command
        }
    })
    .done(function (r) {
        if (!r.success) {
            alert("Erreur sur le noeud : " + node.name + " - " + node.host + "\n" + r.error);
            return;
        }
        if (command.afterEx) command.afterEx(r.data, function (data) {
            cleanResponse(data,command,cb);
        });
        else cleanResponse(r.data, command, cb);
    });
};
var cleanResponse = function (data, command, cb) {
    var output = data;
    if (command.map) {
        if (Array.isArray(data)) {
            output = [];
            $.each(data, function (k, v) {
                output.push(mapCol(v, command));
            });
        } else {
            output = mapCol(data, command);
        }
    }
    cb(output);
};
var mapCol = function (data, command) {
    var cols = [];
    var tmp = data.split(" ");
    for (var indice in tmp) {
        var item = tmp[indice]
        if (item.length > 0) cols.push(item);
    }
    var output = {};
    $.each(command.map, function (k, v) {
        if (k < cols.length)
            output[v] = cols[k];
    });
    return output;
};
/* Managrah */
var printGraph = function (data, command, el) {
    var conf =  $.extend({
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        }
    },
    command.graph.conf);
    // todo : faire quelque chose d'intelligent
    conf.series = command.graph.generateSeries(data);
    if (command.graph.generateCategories)
        conf.xAxis.categories = command.graph.generateCategories(data);

    $(el).highcharts(conf);
};


// Memory
var memory = {
    command: 'free -m | grep "Mem"',
    afterEx: null,
    map: [
        "name",
        "tota",
        "used",
        "free"
    ],
    graph: {
        conf: {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Mémoire'
            },
            series: null
        },
        generateSeriesData: function (data) {
            var sum = parseInt(data.free) + parseInt(data.tota) + parseInt(data.used);
            var output = [{
                name: 'Mem share',
                data: [
                   ['Free', data.free / data.tota * 100],
                   ['Used', data.used / data.tota * 100]
                ]
            }];
            return output;
        }
    }
};
// Disk
var disk = {
    command: 'df -h | grep "^/"',
    afterEx: function (data, cb) {
        data = data.split("\n");
        cb(data);
    },
    map: [
        "name",
        "size",
        "used",
        "avai"
    ],
    graph: {
        conf: {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Disks use'
            },
            xAxis: {
                categories: []
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Disk space'
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            series: [{
                name: 'John',
                data: [5, 3, 4, 7, 2]
            }, {
                name: 'Jane',
                data: [2, 2, 3, 2, 1]
            }, {
                name: 'Joe',
                data: [3, 4, 4, 2, 5]
            }]
        },
        generateSeriesData: function (data) {
            var sum = parseInt(data.free) + parseInt(data.tota) + parseInt(data.used);

            var output = [
               ['Free', data.free / data.tota * 100],
               ['Used', data.used / data.tota * 100]
            ];
            return output;
        }
    }
};

$("#starter").click(function () {
    var chartCount = 0;
    $.each(dbsamere.nodes, function (k, v) {
        var auth = {
            host: v.host,
            username: v.user,
            password: v.pass
        };
        var el = $("<div>").addClass("chart" + chartCount).appendTo($('#chart-container'));
        // memory
        exec(auth, memory, function (data) {
            console.log(v,data);
            printGraph(data, memory, el);
        });
        // disk
        exec(auth, disk, function (data) {
            console.log(data);
        });


    });
});
