var Hapi = require('hapi');

var cfg    = require('../config'),
    player = require('../player');
    
var server = new Hapi.Server(); 
    server.connection({port: cfg.WebPort, host: cfg.WebHost});

//Это теперь вообще непонятно для чего, но пусть пока будут заготовки    
var routes = [
    //{method: 'POST', path:'/auth', handler: player.logon}, 
    //{method: 'POST', path:'/registration', handler:  player.addPlayer}, 
    
    //Вьюшки
    //{method: 'GET', path:'/', handler: { view: 'index.html'}},
    //{method: 'GET', path:'/table', handler: { view: 'table.html'}},
    //{method: 'GET', path:'/registration', handler: { view: 'reg.html'}},
];

module.exports = routes;