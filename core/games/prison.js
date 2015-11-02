//Модуль Тюрьма: Пропуск хода
 
var Cassandra = require('cassandra-driver'),
			 tables = require('../tables'),
              query = require('../query'),
                  cfg = require('../config');
				  
var ID = '0',
	  user_id = 'id_0001';
		  
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var prison = {
	
nextTurn: function nextTurn(ID, user_id) {
    tables.getSeatNumber(ID, user_id) + 1;
}};

module.exports = prison;