const config = require('./../config.json');

const CassandraStore = require('cassandra-store');

let sessionStorage = new CassandraStore({
  table: config.cassandra.table_sessions,
  client : null,
  clientOptions : {
    contactPoints: [config.cassandra.host],
    keyspace: config.cassandra.keyspace
  }
});

module.exports = sessionStorage;