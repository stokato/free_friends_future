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
        [request.params.user_id, request.params.first_name, request.params.last_name, request.params.login, request.params.password, request.params.city, request.params.date, request.params.sex, request.params.relation, request.params.avatar, points], 
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