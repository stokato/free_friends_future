//Модуль Тюрьма: Пропуск хода
 
var Cassandra = require('cassandra-driver'),
        query = require('../query'),
          cfg = require('../config');
          
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var prison = {
getPrisoner: function getPrisoner(error, result) {
    client.execute("select ");
}
};

module.exports = prison;