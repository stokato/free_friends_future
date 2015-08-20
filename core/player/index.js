var Hapi      = require('hapi'),
    Cassandra = require('cassandra-driver');

var cfg   = require('../config'),
    query = require('../query');

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var id     = Cassandra.types.uuid(),
    points = 0;
    
/* 
relation (семейное положение):
  0 — не указано;
  1 — не женат/не замужем;
  2 — есть друг/есть подруга;
  3 — помолвлен/помолвлена;
  4 — женат/замужем:
  5 — всё сложно;
  6 — в активном поиске;
  7 — влюблён/влюблена.
   
sex (пол):
    0 — пол не указан;
    1 — женский;
    2 — мужской.
*/


var player = {
    addPlayer: function addPlayer(request){
        client.execute(query.addPlayer, 
        [id, request.params.user_id, request.params.age, request.params.city, request.params.relation, request.params.sex, request.params.status, points], 
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