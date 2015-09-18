var Hapi      = require('hapi'),
    Cassandra = require('cassandra-driver');

var cfg   = require('../config'),
    query = require('../query'),
    table = require('../tables');

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});

var player = {
    
addPlayer: function addPlayer(request, reply){
        
        //Задаем начальное значение поинтов и монеток
        var points = 0,
            coins  = 0; 
        
        //Разбиваем строку с датой рождения в массив
        var data = request.payload.born_date;
            data = data.split(".");
            
        //Сохранеям данные в отдельные переменные    
        var D = data[0], //День
            M = data[1], //Месяц
            Y = data[2]; //Год
        
        client.execute(query.addPlayer, 
        [request.payload.ID, request.payload.country, request.payload.city, new Date(Y, M, D), request.payload.sex, coins, points], 
        {prepare: true}, function(err) {
            if(err) {
                console.log(err);
            }
            else {
                reply.redirect('/');
            }
        });
            
},

logon: function logon(request, reply) {
    var auth_id = request.payload.user_id;
        
    client.execute(query.logon, [auth_id], {prepare: true}, function(error, response) {
            if(error) {
                console.log(error);
                reply.redirect('/');
            }
            else {
                reply.redirect('/table');
            }
    });
}
};

module.exports = player;