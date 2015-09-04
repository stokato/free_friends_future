var Hapi      = require('hapi'),
    Cassandra = require('cassandra-driver');

var cfg   = require('../config'),
    query = require('../query'),
    OS    = require('os');

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var client = new Cassandra.Client({contactPoints: [cfg.DataHost,cfg.DataPort], keyspace: cfg.DataKeys});
    
var player = {
    
addPlayer: function addPlayer(request, reply){
        
        //Задаем значение поинтов
        var points = 0;
        
        //Путь к каталогу с фотками/авами
        avatar = OS.tmpdir() + '\\img\\noavatar.jpg';
        
        //Сохраняем в переменные пароли из полей
        //для последующей проверки на совпадение
        var passwd    = request.payload.pass;
        var re_passwd = request.payload.re_pass;
        
        //Разбиваем строку с датой рождения в массив
        var data = request.payload.born_date;
            data = data.split(".");
            
        //Сохранеям данные в отдельные переменные    
        var D = data[0], //День
            M = data[1], //Месяц
            Y = data[2]; //Год
        
        if(passwd == re_passwd) {
        client.execute(query.addPlayer, 
        [request.payload.ID, request.payload.first_name, request.payload.last_name, request.payload.login, request.payload.pass, request.payload.city, new Date(Y, M, D), request.payload.sex, request.payload.relation, avatar, points], 
        {prepare: true}, function(err) {
            if(err) {
                console.log(err);
            }
        });
            reply.redirect('/');
        }
        else {
            reply.redirect('/registration');
        }
    },

logon: function logon(request, reply) {
    var login = request.payload.login,
        pass  = request.payload.pass;
        
    client.execute(query.logon, [login], {prepare: true}, function(error, response) {
            if(error) {
                console.log(error)
            }
            else {
                if(response.rows[0].password == pass) {
                    player.getID(login);
                    reply.redirect('/table');
                }
                else {
                    reply.redirect('/');
                }
            }
    });
},

getID: function getID(login) {
    client.execute(query.getID, [login], {prepare: true}, function(error, response) {
            if(error) {
                console.log(error);
            }
            else {
                 return response.rows[0].user_id;
            }
    });
}
};

module.exports = player;