var server_cfg = require('./server');

//Переменные для настройки веб-сервера
var WebHost = server_cfg.WebServer.host,
    WebPort = server_cfg.WebServer.port;
    
//Переменные для настройки сервера баз данных
var DataHost = server_cfg.DataBaseServer.host,
    DataPort = server_cfg.DataBaseServer.port,
    DataKeys = server_cfg.DataBaseServer.keyspace;

//Импорнт данных для настроек серверов
var config = {
    WebHost : WebHost,
    WebPort : WebPort,
    DataHost: DataHost,
    DataPort: DataPort,
    DataKeys: DataKeys
};

module.exports = config;