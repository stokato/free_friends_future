var GameError = require('./../../../game_error');
var constants = require('../../constants_game');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(id, opt) {
    var options = {};
    for(var i = 0; i < game.actionsQueue[id].length; i ++) {
      var uid = game.actionsQueue[id][i];
      if(!game.gRoom.guys[uid] && !game.gRoom.girls[uid]) {
        game.stop();
        return new GameError(game.gSocket, 'GAMESYMPATHY', "Неверные агрументы");
      }
    }

    options['pick'] = { id : opt.id, pick : game.actionsQueue[id]};
    game.emit(options, id);

    if(game.countActions == 0) {

      game.nextGame = 'start';
      game.currPlayers = [];
      pushAllPlayers(gRoom, game.currPlayers);
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.handlers[game.nextGame], game.countActions);
    }
  }
};