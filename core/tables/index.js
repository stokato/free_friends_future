var players = require('../player'),
        cfg = require('../config');

var Cassandra = require('cassandra-driver'),
       client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var rooms = [],
         i = 0,
         j = 0,
        id = 0;
         
function callback(err, result) {
    if(err) {
        console.log('Error message: ' + err);
    }
    else {
        //Перебираем в цикле массив result и результат сохраняем в массиве rooms
        //Чет мне кажется это какое-то лишнее действие, ну да ладно, пусть пока что будет
        for(i = 0; i < result.rows[0].seats.length; i++) {
            rooms[i] = result.rows[0].seats[i];
        }
    }
    //Если за столом есть места, выводим в консоли мессадж о кол-ве свободных мест
    //Надо будет доработать функцию, чтобы добавлялись новые IDшники игроков если есть места
    if(12 > rooms.length) {
        console.log('За столом еще есть: %d мест', 12 - rooms.length);
    }
    else {
        console.log('Данный стол полный, идет создание нового стола. Ждите...');
        //Получаем ID текущего стола, и инкриментим его
        id = result.rows[0].id;
        id++;
        //Вызываем функцию создания нового стола
        tables.addNewTable();
    }
}
         
var tables = {
//Проверить столы на заполненность 
checkTables: function checkTables(id) {
   client.execute("select * from rooms where id = ?", [id], {prepare: true}, callback);
},
    
//Функция создает новый стол, если за другими столами нет свободных мест
addNewTable: function addNewTable() {
    client.execute("insert into rooms (id, seats) values (?,?)",[id,['id_013']], {prepare: true}, function(err, result) {
            if(err) {
                console.log(err);
            }
            else {
                console.log('Стол #%d успешно создан', id);
            }
    });
}
};

module.exports = tables;