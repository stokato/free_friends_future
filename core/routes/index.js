var Hapi = require('hapi');
var fs = require('fs');

var cfg    = require('../config'),
    player = require('../player');
    
var server = new Hapi.Server(); 
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var routes = [
    {method: 'POST', path:'/auth', handler: player.logon}, 
    {method: 'POST', path:'/registration', handler:  player.addPlayer}, 
    
    //Вьюшки
    {method: 'GET', path:'/', handler: { view: 'index.html'}},
    {method: 'GET', path:'/table', handler: { view: 'table.html'}},
    {method: 'GET', path:'/registration', handler: { view: 'reg.html'}},
    
    //Лэйауты
    {method: 'GET', path: '/free_seat.jpg',      handler: { file: './img/free_seat.jpg' } },
    {method: 'GET', path: '/style.css',          handler: { file: './css/style.css' } },
    {method: 'GET', path: '/client.js',          handler: { file: './js/client.js' } },  
    {method: 'GET', path: '/cookie-1.2.2.js',    handler: { file: './Frameworks/cookie-1.2.2.js' } },
    {method: 'GET', path: '/jquery-2.1.4.js',    handler: { file: './Frameworks/jquery-2.1.4.js' } },
    {method: 'GET', path: '/socket.io-1.3.7.js', handler: { file: './Frameworks/socket.io-1.3.7.js' } }
];

module.exports = routes;