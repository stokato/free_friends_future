var Hapi      = require('hapi'),
    Cassandra = require('cassandra-driver');

var config = require('../config');

var WebHost  = config.WebServer.host;
    WebPort  = config.WebServer.port,
    DataHost = config.DataBaseServer.host,
    DataPort = config.DataBaseServer.port,
    DataKeys = config.DataBaseServer.keyspace;

init = {
    
   initWeb: function initWeb(){
       
        var server = new Hapi.Server();
            server.connection({port: WebPort, host: WebHost});
            
            server.start(function(err) {
                if(err) {
                    console.log(err);
                }
                else {
                    console.log('Server running: ' + server.info.uri);
                }
        })
    },
    
    initData: function initData() {
        var client = new Cassandra.Client({contactPoints: [DataHost,DataPort], keyspace: DataKeys});
        return client;
    }
    
};

module.exports = init;