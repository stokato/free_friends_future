var chat   = require('./chat'),
    config = require('./config'),
    games  = require('./games'),
    player = require('./player'),
    query  = require('./query'),
    routes = require('./routes'),
    tables = require('./tables');

var core = {
    chat: chat,
    config: config,
    games: games,
    player: player,
    query: query,
    routes: routes,
    tables: tables
};

module.exports = core;