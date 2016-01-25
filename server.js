var http = require("http");
var server = http.createServer();
var Config = require('./config.json').server;

server.listen(Config.port, function() {
    require('./chat_srv').listen(server.listener, function(){});

    console.log('server running at: ' + Config.host + ':' + Config.port);
});
