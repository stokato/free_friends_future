var Hapi = require('hapi');

var cfg    = require('../config'),
    player = require('../player');


var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var routes = [
    {method: 'GET', path: '/{user_id},{age},{city},{relation},{sex},{status}', handler: player.addPlayer},
];

module.exports = routes;