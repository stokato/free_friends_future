var Hapi = require('hapi');

var cfg    = require('../config'),
    player = require('../player');


var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var routes = [
      {method: 'POST', path:'/registration', handler:  function(request, reply) {reply(request.payload.Photo);}}, 
    //{method: 'POST', path:'/registration', handler:  player.addPlayer}, 
    
    //Вьюшки
    {method: 'GET', path:'/', handler: { view: 'index.html'}},
    {method: 'GET', path:'/registration', handler: { view: 'reg.html'}},
];

module.exports = routes;