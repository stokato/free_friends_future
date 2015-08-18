var Hapi = require('hapi');
var core = require('./core');

var routes = core.routes,
    cfg    = core.config;
    
var WebPort = cfg.WebServer.port,
    WebHost = cfg.WebServer.host;

var server = new Hapi.Server();
    server.connection({port: WebPort, host: WebHost});

server.route(routes);

server.start(function(err) {
    if(err){
        console.log(err);
    }
    else{
        console.log('Demon is run');
    }
});