var constants = require('../constants');
var constants_io = require('../../io/constants');

var randomPlayer = require('./random_player'),
  startTimer         = require('./start_timer'),
    setActionsLimit = require('./set_action_limits'),
  activateAllPlayers = require('./activate_all_players'),
  getPlayersID = require('./get_players_id'),
  getPrison  = require('../lib/get_prison');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result, isTimeout) { result = result || {}; isTimeout = isTimeout || false;
  //var f = constants_io.FIELDS;

  var player = randomPlayer(this.gRoom, null, null, this.gPrisoners);
  if(!player) {
    return this.stop();
  }
  this.gNextGame = constants.G_START;

  this.gActivePlayers = {};
  this.gActionsQueue = {};


  activateAllPlayers(this.gRoom, this.gActivePlayers, null, this.gPrisoners);

  setActionsLimit(this, 1);

  this.gActionsCount = this.gRoom.girls_count + this.gRoom.guys_count - this.countPrisoners;

  result.next_game = this.gNextGame;

  result.players = getPlayersID(this.gActivePlayers);

  result.prison = getPrison(this.gPrisoners);

  this.emit(player.getSocket(), result);
  this.gameState = result;


  var timeout = (isTimeout)? 5 * 1000 : 0;

  this.gTimer = startTimer(this.gHandlers[this.gNextGame], timeout);
};