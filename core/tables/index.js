var players = require('../player'),
        cfg = require('../config');

var Cassandra = require('cassandra-driver'),
       client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var id      = null,
    user_id = 'id_003'; 

//Калбэк для функции checkAll()
function callback_checkAll(err, res) {
    var count = 0;
    var rooms = [];
    if(err) {
        console.log("Message (checkAll) error: ", err);
    }
    else {
        for(var i = 0; i < res.rows.length; i++) {
            count++;
        }
        if(count == 0) {
            tables.createNewTable();
        }
        else {
            for(var i = 0; i < count; i++) {
                rooms[i] = res.rows[i].id;
            }
            tables.seatPlayer(rooms[0]);
        }
    }
};

//Калбэк для функции returnMaxID()
function callback_returnMaxID (err, res) {
    var max = 0;
    if(err) {
        console.log("Message (returnMaxID) error: ", err);
    }
    else {
        for(var i = 0; i < res.rows.length; i++) {
            if(res.rows[i].id > max) {
                max = res.rows[i].id;
            }
        }
        tables.createNewTable(max);
    }
};

//Калбэк фунцкии createNewTable()
function callback_createNewTable(err, res) {
    if(err) {
        console.log("Message (createNewTable) error: ", err);
    }
    else {
        var id = 0;
        user_id = 'id_001';
        tables.seatPlayer(user_id, id);
    }
};

//Калбэк функции seatPlayer
function callback_seatPlayer(err, res) {
    console.log("Результатик наш: ", res);
    if(err) {
        console.log("Message (seatPlayer) error: ", err);
    }
    else {
        tables.checkTable();
    }
};

//Калбэк функции checkSeats
function callback_checkSeats(err, res) {
    if(err) {
        console.log("Message (checkSeats) error: ", err);
    }
    else {
        if(res.rows.length == 12) {
            tables.checkFlag();
        }
    }
};

//Калбэк для функции checkFlag
function callback_checkFlag(err, res) {
        if(err) {
            console.log("Message (checkFlag) error: ", err);
        }
        else {
            if(res.row.flag == true) {
                tables.setFalse();
            }
        }
};

//Калбэк для функции setFalse
function callback_setFalse (err) {
        if(err) {
            console.log("Message (setFalse) error: ", err);
        }
        else {
            console.log("Flag updated");
        }
};

//Калбэк ждя функции setTrue
function callback_setTrue(err, res) {
        if(err) {
            console.log("Message (setTrue) error: ", err);
        }
        else {
            console.log("Flag updated");
        }
};
       
var tables = {
//Проверяет есть ли столы с флагом: true
checkAll: function checkAll() {
    client.execute("select id from rooms where flag = true", {prepare: true}, callback_checkAll);
},

//Создает новый стол, если не был найден не один стол с флагом: true
createNewTable: function createNewTable(id) {
    id++;
    client.execute("insert into rooms (id, flag) values (?,?)", [id, true], {prepare: true}, callback_createNewTable)
},

//Посадить игрока за первый попавшийся стол с флагом: true
seatPlayer: function seatPlayer(user_id, id) {
    client.execute("update rooms set seats = seats + ?, flag = true where id = ?",[[user_id], id], {prepare: true}, callback_seatPlayer)
},

//Проверить сколько за столом осталось мест
checkSeats: function checkSeats() {
    client.execute("select seats from room where id = ?", [max], {prepare: true}, callback_checkSeats)
},

//Вернуть наибольший ID стола
returnMaxID: function returnMaxID() {
    client.execute("select id from rooms", {prepare: true}, callback_returnMaxID);
},

//Проверяет флаг стола
checkFlag: function checkFlag(id) {
    client.execute("select flag where id = ?",[id], {prepare: true}, callback_checkFlag);
},

//Сменить флаг стола на true
setTrue: function setTrue() {
    client.execute("update rooms set flag = true where id = ?", [id], {prepare: true}, callback_setTrue);
},

//Сменить флаг стола на false 
setFalse: function setFalse(id) {
    client.execute("update rooms set flag = false where id = ?", [id], {prepare: true}, callback_setFalse);
}};

module.exports = tables;
//tables.checkAll();
tables.createNewTable(0);