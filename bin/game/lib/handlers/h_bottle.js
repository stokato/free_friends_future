var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setAnswersLimit = require('../set_answers_limits');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(socket, timer, uid) {
    if(!timer) { clearTimeout(game.currTimer); }

    var firstPlayer = null;
    if(uid) {
      firstPlayer = game.currPlayers[uid];
    } else {
      for(var item in game.currPlayers) if(game.currPlayers.hasOwnProperty(item)) {
        firstPlayer = game.currPlayers[item];
      }
    }

    var firstGender = firstPlayer.getSex();
    var secondGender = (firstGender == 1) ? 2 : 1;
    var player = randomPlayer(game.gRoom, secondGender);
    game.currPlayers[player.getID()] = player;
    setAnswersLimit(game, 1);
    game.nextGame = 'bottle_kisses';
    game.countActions = 2;
    game.actionsQueue = {};

    var options = {};
    options['players'] = getPlayersID(game.currPlayers);

    game.emit(socket, options);

    game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
  }
};
