var constants = require('../constants');
var constants_io = require('../../io/constants');

var randomPlayer = require('./random_player'),
  startTimer         = require('./start_timer'),
    setActionsLimit = require('./set_action_limits'),
  getPlayerInfo  = require('../lib/get_player_info');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function() {
  var f = constants_io.FIELDS;

  // Если игроков меньше допустимого количества - останавливаем игру
  if(this.gRoom.guys_count < constants.PLAYERS_COUNT ||
      this.gRoom.girls_count < constants.PLAYERS_COUNT) {
    return this.stop();
  }

  var player = randomPlayer(this.gRoom, null);
  this.gNextGame = constants.G_LOT;

  this.gActivePlayers = {};
  this.gActionsQueue = {};

  var playerInfo = getPlayerInfo(player);
  this.gActivePlayers[playerInfo.id] = playerInfo;

  setActionsLimit(this, 1);
  this.gActionsCount = 1;

  var result = {};
  result[f.next_game] = this.gNextGame;
  result[f.players] = [{id: playerInfo.id, vid: playerInfo.vid}];

  this.emit(player.getSocket(), result);
  this.gameState = result;

  //this.gHandlers.lot(null, player.getID());

  this.gTimer = startTimer(this.gHandlers[this.gNextGame]);
};