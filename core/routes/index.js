var Hapi = require('hapi');

var cfg  = require('../config'),
    data = require('../data'),
    user = require('../socNet/vk/user');
    
var WebPort  = cfg.WebServer.port,
    WebHost  = cfg.WebServer.host;

var server = new Hapi.Server();
    server.connection({port: WebPort, host: WebHost});
    
var routes = [
    {method: 'GET', path: '/{user_id}', handler: data.insertID},
    {method: 'GET', path: '/{user_sex}', handler: user.getSex},
    {method: 'GET', path: '/{user_uid}', handler: user.getID},
];

module.exports = routes;