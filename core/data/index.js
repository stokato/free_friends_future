var Cassandra = require('cassandra-driver');

var cfg  = require('../config');

var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

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