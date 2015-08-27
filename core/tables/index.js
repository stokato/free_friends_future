var players = require('../player'),
        cfg = require('../config');

var Cassandra = require('cassandra-driver'),
       client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var id = null;

function callback(err, res) {
    var count = 0;
    if(err) {
        console.log("Message error: ", err);
    }
    else {
        for(var i = 0; i < res.rows.length; i++) {
            count++;
        }
    }
}
         
var tables = {
//Выбирает все столы с флагом: true (со свободными местами)
//Флаг: false - означает, что свободных мест за столом нет
checkTables: function checkTables() {
    client.execute("select id from rooms where flag = 1", {prepare: true}, callback);
},

//Создает новый стол, если не был найден не один стол с флагом: true
createNewTable: function createNewTable() {
    
},

//Посадить игрока за первый попавшийся стол с флагом: true
seatPlayer: function seatPlayer() {
    
}
};

module.exports = tables;
tables.checkTables();