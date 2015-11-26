var Hapi = require('hapi'),
    Hoek = require('hoek');

var core = require('./core');

var routes = core.routes,
    chat   = core.chat;
    cfg    = core.config;

var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
   
//================== Вьюха для клиента ==========

server.register(require('vision'), function (err) {
	
Hoek.assert(!err, err);
	
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './view',
    context: cfg
});
});

//===============================================

server.register(require('inert'), function () {
    
 server.route(routes); 

 server.start(function(err) {
    if(err){
        console.log(err);
    }
    else{
        //require(chat).init(server.listener, function(){
			console.log('Hapi server started @ '  + server.info.uri);
		//});
    }
});

});