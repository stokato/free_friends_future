var Cassandra = require('cassandra-driver');
var cfg  = require('../config');

var DataHost = cfg.DataBaseServer.host,
    DataPort = cfg.DataBaseServer.port,
    DataKeys = cfg.DataBaseServer.keyspace;

var client = new Cassandra.Client({contactPoints: [DataHost,DataPort], keyspace: DataKeys});

var data = {
    insertID: function insertID(request) {
    var id = Cassandra.types.uuid();
    client.execute("INSERT INTO users (id, viewer_id) VALUES (?,?)", [id, request.params.user_id], {prepare: true}, function(err) {
        if (err) {
             console.log('Error:', err);
            }
        else{
            console.log('data has inserted');
        }
       }
    );
    }
};

module.exports = data;