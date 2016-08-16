var config = require('./../config.json');

var CassandraStore = require('cassandra-store');

var sessionStorage = new CassandraStore({
  table: config.cassandra.table_sessions,
  client : null,
  clientOptions : {
    contactPoints: [config.cassandra.host],
    keyspace: config.cassandra.keyspace
  }
});

module.exports = sessionStorage;