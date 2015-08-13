//Web server settings [host, port]
var WebServer  = ['localhost', 80];
//Database server settings [host, port, keyspace]
var DataBaseServer = ['localhost', 9042, 'meet']; 

//export data
module.exports.WebServer = WebServer;
module.exports.DataBaseServer = DataBaseServer;