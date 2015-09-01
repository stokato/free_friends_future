var Hapi      = require('hapi'),
    Cassandra = require('cassandra-driver');

var cfg   = require('../config'),
    query = require('../query');

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});
var points = 0;
    
var player = {
    
    addPlayer: function addPlayer(request){
        client.execute(query.addPlayer, 
        [request.payload.ID, request.payload.first_name, request.payload.last_name, request.payload.login, request.payload.pass, request.payload.city, request.payload.born_date, request.payload.sex, request.payload.relation, request.params.avatar, points], 
        {prepare: true}, function(err, result) {
            if(err) {
                console.log(err);
            }
            else {
                console.log('Done: ', result);
            }
    });
    }
};

module.exports = player;