var chat   = require('./chat'),
    config = require('./config'),
    games  = require('./games'),
    player = require('./player'),
    query  = require('./query'),
    routes = require('./routes');

var core = {
    chat: chat,
    config: config,
    games: games,
    player: player,
    query: query,
    routes: routes    
};

module.exports = core;