var constants = require('../constants');
var constants_io = require('../../io/constants');

var randomPlayer = require('./random_player'),
  startTimer         = require('./start_timer'),
    setActionsLimit = require('./set_action_limits'),
  activateAllPlayers = require('./activate_all_players'),
  getPlayersID = require('./get_players_id'),
  getPlayerInfo  = require('../lib/get_player_info');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result) { result = result || {};
  var f = constants_io.FIELDS;

  var player = randomPlayer(this.gRoom, null);
  if(!player) {
    return this.stop();
  }
  this.gNextGame = constants.G_START;

  this.gActivePlayers = {};
  this.gActionsQueue = {};

  //var playerInfo = getPlayerInfo(player);
  //this.gActivePlayers[playerInfo.id] = playerInfo;

  activateAllPlayers(this.gRoom, this.gActivePlayers);

  setActionsLimit(this, 1);
  //this.gActionsCount = 1;
  this.gActionsCount = this.gRoom.girls_count + this.gRoom.guys_count;

  //var result = {};
  result[f.next_game] = this.gNextGame;
  //result[f.players] = [{id: playerInfo.id, vid: playerInfo.vid}];
  result[f.players] = getPlayersID(this.gActivePlayers);

  this.emit(player.getSocket(), result);
  this.gameState = result;

  //this.gHandlers.lot(null, player.getID());

  this.gTimer = startTimer(this.gHandlers[this.gNextGame]);
};