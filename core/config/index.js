var server_cfg = require('./server'),
    template   = require('./template'); 

//The variable web-server settings
var WebHost = server_cfg.WebServer.host,
    WebPort = server_cfg.WebServer.port;
    
//The variable database-server settings
var DataHost = server_cfg.DataBaseServer.host,
    DataPort = server_cfg.DataBaseServer.port,
    DataKeys = server_cfg.DataBaseServer.keyspace;
    
/* Templates variables: BEGIN*/

//Main page
var indexTitle = template.index.title;

//Registration page
var regTitle = template.reg.title;

//Table page
var tableTitle = template.table.title;

/* Templates variables: END*/

var config = {
    WebHost : WebHost,
    WebPort : WebPort,
    DataHost: DataHost,
    DataPort: DataPort,
    DataKeys: DataKeys,
    
    indexTitle: indexTitle,
    regTitle: regTitle,
    tableTitle: tableTitle
};

module.exports = config;