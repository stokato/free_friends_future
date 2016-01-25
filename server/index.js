var cfg = require('./config/configuration.js');

var server = require('socket.io')(cfg.server.port);
var sockets = server.listen;