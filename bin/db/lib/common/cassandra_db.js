/**
 * Набор инструментов для работы с БД
 */

const configCassandra = require('./../../../../config.json').cassandra; // Настойки доступа к БД
const cassandra       = require('cassandra-driver');
const buildQuery      = require('./build_query');

// Интерфейс с БД Кассандра
function CassandraDB () {
  this.client = new cassandra.Client({
    contactPoints: [configCassandra.host],
    keyspace: configCassandra.keyspace
  });

  this.uuid = cassandra.types.Uuid;  // Генератор id для Cassandra
  this.timeUuid = cassandra.types.TimeUuid;
}

let cassandraDB = new CassandraDB();

// Клиент БД
module.exports.client = cassandraDB.client;

// Генераторы ИД
module.exports.uuid = cassandraDB.uuid;
module.exports.timeUuid = cassandraDB.timeUuid;

// Построитель запросов
module.exports.qBuilder = buildQuery;