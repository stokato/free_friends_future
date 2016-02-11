var http = require("http");
var Config = require('./config.json').server;
var path = require("path");
var fs = require("fs");

var server = http.createServer();

server.listen(Config.port, function() {
    require('./bin/io').listen(server, function(){
        console.log('server running at: ' + Config.host + ':' + Config.port);
    });
});

