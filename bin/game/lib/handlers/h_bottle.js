var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    if(!timer) { clearTimeout(game.currTimer); }

    var firstGender = game.currPlayers[uid].getSex();
    var secondGender = (firstGender == 'guy') ? 'girl' : 'guy';
    var player = randomPlayer(game.gRoom, secondGender);
    game.currPlayers[player.getID()] = player;
    game.nextGame = 'bottle_kisses';
    game.countActions = 2;
    game.actionsQueue = {};

    var options = {};
    options['players'] = getPlayersID(game.currPlayers);
    game.emit(options);

    game.currTimer = startTimer(game.handlers[game.nextGame]);
  }
};
