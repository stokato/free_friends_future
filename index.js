var Hapi = require('hapi');

var core  = require('./core');

var routes = core.routes,
    cfg    = core.config;

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
   
//================== Вьюха для клиента ================
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './view',

});
//=====================================================
server.route(routes);

server.start(function(err) {
    if(err){
        console.log(err);
    }
    else{
        console.log('Hapi server started @ '  + server.info.uri);
    }
});