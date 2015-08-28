var players = require('../player'),
        cfg = require('../config');

var Cassandra = require('cassandra-driver'),
       client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var id = null;

//Калбэк для функции checkAll()
function callback_checkAll(err, res) {
    var count = 0;
    if(err) {
        console.log("Message error: ", err);
    }
    else {
        for(var i = 0; i < res.rows.length; i++) {
            count++;
        }
        if(count == 0) {
            tables.createNewTable();
        }
        else {
            tables.selectTable();
        }
    }
};

//Калбэк для функции returnMaxID()
function callback_returnMaxID (err, res) {
    var max = 0;
    if(err) {
        console.log("Message error: ", err);
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
function callback_createNewTable(err) {
    if(err) {
        console.log("Message error: ", err);
    }
    else {
        tables.seatPlayer();
    }
};

//Калбэк функции seatPlayer
function callback_seatPlayer(err) {
    if(err) {
        console.log("Message error: ", err);
    }
    else {
        tables.checkTable();
    }
};

//Калбэк функции checkTable
function callback_checkSeats(err, res) {
    if(err) {
        console.log("Message error: ", err);
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
            console.log("Message error: ", err);
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
            console.log("Message error: ", err);
        }
        else {
            console.log("Flag updated");
        }
};

//Калбэк ждя функции setTrue
function callback_setTrue(err, res) {
        if(err) {
            console.log("Message error: ", err);
        }
        else {
            console.log("Flag updated");
        }
};

//Калбэк для функции selectTable
function callback_selectTable(err, res) {
    if(err) {
        console.log("Message error: ", err);
    }
    else {
        tables.seatPlayer();
    }
}
         
var tables = {
//Проверяет есть ли столы с флагом: true
checkAll: function checkAll() {
    client.execute("select id from rooms where flag = true", {prepare: true}, callback_checkAll);
},

//Создает новый стол, если не был найден не один стол с флагом: true
createNewTable: function createNewTable(max) {
    max++;
    client.execute("insert into rooms (id, flag) values (?,?)", [max, true], {prepare: true}, callback_createNewTable)
},

//Посадить игрока за первый попавшийся стол с флагом: true
seatPlayer: function seatPlayer(max) {
    client.execute("update rooms set seats = seats + [?] where id = ?",[['id_00X'], max], {prepare: true}, callback_seatPlayer)
},

//Выбрать первый попавшийся стол с флагом: true
selectTable: function selectTable() {
    client.execute("select id from rooms where flag = true", {prepare: true}, callback_selectTable);
},

//Проверить сколько за столом осталось мест
checkTable: function checkSeats() {
    client.execute("select seats from room where id = ?", [max], {prepare: true}, callback_checkSeats)
},

//Вернуть наибольший ID стола
returnMaxID: function returnMaxID() {
    client.execute("select id from rooms", {prepare: true}, callback_returnMaxID);
},

//Проверяет флаг стола
checkFlag: function checkFlag() {
    client.execute("select flag where id = ?",[id], {prepare: true}, callback_checkFlag);
},

//Сменить флаг стола на true
setTrue: function setTrue() {
    client.execute("update rooms set flag = true where id = ?", [id], {prepare: true}, callback_setTrue);
},

//Сменить флаг стола на false 
setFalse: function setFalse() {
    client.execute("update rooms set flag = false where id = ?", [id], {prepare: true}, callback_setFalse);
}};

module.exports = tables;
tables.checkAll();