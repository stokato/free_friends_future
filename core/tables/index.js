var players = require('../player'),
        cfg = require('../config');

var Cassandra = require('cassandra-driver'),
       client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys}),
           id = Cassandra.types.uuid();


var rooms = [],
         i = 0,
         j = 0;
         
var tables = {
//Проверить столы на заполненность 
checkTables: function checkTables() {
   client.execute("select * from rooms", {prepare: true}, function (err,result) {
       if(err) {
           console.log(err);
       }
       else {
           for(i = 0; i < result.rows[0].seats.length; i++) {
               rooms[i] = result.rows[0].seats[i];
           }
       }
});

},
    
//Создать новый стол
addNewTable: function addNewTable() {
},

//Удалить стол
deleteTable: function deleteTable() {
}
};

module.exports = tables;

tables.checkTables();