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

// DECLARATION
var addNode = function (newHost, newUser, newPass) {
    var newNode = $(".node-pattern").clone();
    newNode.removeClass("node-pattern");
    newNode.addClass("node");
    newNode.find(".hostname").text(newHost);
    newNode.find(".username").text(newUser);
    newNode.find(".password").text(newPass);
    newNode.appendTo(".node-container");
};

// INIT 
var init = localStorage.getItem("dbsamere");
if (init) dbsamere = JSON.parse(init);
if (dbsamere) {
    if (dbsamere.lastuser) {
        $("#username").val(dbsamere.lastuser.name);
        $("#password").val(dbsamere.lastuser.password);
    }
    if (dbsamere.nodes && dbsamere.nodes.length > 0) {
        $.each(dbsamere.nodes, function (k, v) {
            addNode(v.host, v.user, v.pass);
        });
    }
    if (dbsamere.lastcommand) {
        $("#command").val(dbsamere.lastcommand);
    }
}

// UX

$("#creator").click(function () {
    var newHost = $("#hostname").val();
    var newUser = $("#username").val();
    var newPass = $("#password").val();

    addNode(newHost, newUser, newPass);

    if (!dbsamere.lastuser) dbsamere.lastuser = {};
    dbsamere.lastuser.name = newUser;
    dbsamere.lastuser.password = newPass;
    if (!dbsamere.nodes) dbsamere.nodes = [];
    dbsamere.nodes.push({
        host: newHost,
        user: newUser,
        pass: newPass
    });

    localStorage.setItem('dbsamere', JSON.stringify(dbsamere));
});

$("#commander").click(function () {
    var command = $("#command").val();
    if (!command) alert("où est ma commande ?");
    if (!dbsamere.nodes || dbsamere.nodes.length == 0) alert("Aucun noeud à contacter");
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

