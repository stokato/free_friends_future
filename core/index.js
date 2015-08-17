var api    = require('./lib');
var config = require('./config');
var data   = require('./data');
var games  = require('./games');
var routes = require('./routes');

module.exports = {
    api: api,
    config: config,
    data: data,
    games: games,
    routes: routes
};