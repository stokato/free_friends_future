//Модуль Тюрьма: Пропуск хода
 
var Cassandra = require('cassandra-driver'),
	   tables = require('../tables'),
		query = require('../query'),
		  cfg = require('../config');

var io = require('socket.io')(3014);
var sockets = io.listen;

//Глобальные переменные используемые временно в качестве заглушек
ID = '0',
user_id = 'id_0001';
		  
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

function nextTurn(ID, user_id) {
    tables.getSeatNumber(ID, user_id) + 1;
};

io.on('prison', function(socket) {
	socket.on('geID', function(soccket, user_id) {
		nextTurn(socket.id, user_id)
		socket.broadcast.emit('setPrison', {id:socket.id});
	});
});