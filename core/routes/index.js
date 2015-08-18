var Hapi = require('hapi');

var cfg  = require('../config'),
    data = require('../data'),
    user = require('../socNet/vk/user');


var server = new Hapi.Server();
    server.connection({port: cfg.WebPort, host: cfg.WebHost});
    
var routes = [
    {method: 'GET', path: '/{user_id}', handler: data.insertID},
    {method: 'GET', path: '/{user_sex}', handler: user.getSex},
    {method: 'GET', path: '/{user_uid}', handler: user.getID},
];

module.exports = routes;