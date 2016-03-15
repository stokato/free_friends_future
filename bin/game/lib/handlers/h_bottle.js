var constants = require('../../constants');
var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setActionsLimit = require('../set_action_limits');

// Бутылочка, крутившему бутылочку выбираем пару проитивоположного пола, ходят они двое
module.exports = function(game) {
  return function(timer, uid) {
    if(!timer) { clearTimeout(game.gTimer); }

    var firstPlayer = null;
    if(uid) {
      firstPlayer = game.gActivePlayers[uid];
    } else {
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        firstPlayer = game.gActivePlayers[item];
      }
    }

    var firstGender = firstPlayer.getSex();
    var secondGender = (firstGender == constants.CONFIG.sex.male)
             ? constants.CONFIG.sex.female : constants.CONFIG.sex.male;
    var secondPlayer = randomPlayer(game.gRoom, secondGender);

    game.gActivePlayers[secondPlayer.getID()] = secondPlayer;
    game.gActionsQueue = {};

    setActionsLimit(game, 1);
    game.gActionsCount = 2;

    game.gNextGame = constants.G_BOTTLE_KISSES;

    var result = { players: getPlayersID(game.gActivePlayers) };

    game.emit(firstPlayer.getSocket(), result);

    game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
  }
};
