//The configuration of the Web server and database server
var server_cfg = {
    WebServer: {
         host: 'localhost',
         port: '80'
    },
    
    DataBaseServer: {
        host:     'localhost',
        port:     '9042',
        keyspace: 'meet'
    },
};

module.exports = server_cfg;