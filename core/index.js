var config = require('./config'),
    data   = require('./data'),
    games  = require('./games'),
    routes = require('./routes'),
    socNet = require('./socNet');

var core = {
    config: config,
    data: data,
    games: games,
    routes: routes,
    socNet: socNet
};

module.exports = core;