var server_cfg = require('./server');

//The variable web-server settings
var WebHost = server_cfg.WebServer.host,
    WebPort = server_cfg.WebServer.port;
    
//The variable database-server settings
var DataHost = server_cfg.DataBaseServer.host,
    DataPort = server_cfg.DataBaseServer.port,
    DataKeys = server_cfg.DataBaseServer.keyspace;

var config = {
    WebHost : WebHost,
    WebPort : WebPort,
    DataHost: DataHost,
    DataPort: DataPort,
    DataKeys: DataKeys
};

module.exports = config;