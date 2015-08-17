//The configuration of the Web server and database server
var config = {
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

module.exports = config;