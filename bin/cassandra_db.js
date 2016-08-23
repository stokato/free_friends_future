var configCassandra = require('./../config.json').cassandra; // Настойки доступа к БД
var cassandra = require('cassandra-driver');
var buildQuery = require('./db/lib/build_query');

// Интерфейс с БД Кассандра
function CassandraDB () {
  this.client = new cassandra.Client({
    contactPoints: [configCassandra.host],
    keyspace: configCassandra.keyspace
  });

  this.uuid = cassandra.types.Uuid;  // Генератор id для Cassandra
  this.timeUuid = cassandra.types.TimeUuid;
}

var cassandraDB = new CassandraDB();

module.exports.client = cassandraDB.client;
module.exports.uuid = cassandraDB.uuid;
module.exports.timeUuid = cassandraDB.timeUuid;
module.exports.qBuilder = buildQuery;