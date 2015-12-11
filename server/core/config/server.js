//Конфигурация веб-сервера и сервера баз данных
var server_cfg = {
    WebServer: {
         host: 'localhost',
         port: '3000'
    },
    
    DataBaseServer: {
        host:     'localhost',
        port:     '9042',
        keyspace: 'meet'
    },
};

module.exports = server_cfg;