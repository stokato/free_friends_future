var constants = require('../constants');
var constants_io = require('../../io/constants');

var randomPlayer     = require('./random_player'),
  startTimer         = require('./start_timer'),
  setActionsLimit    = require('./set_action_limits'),
  activateAllPlayers = require('./activate_all_players'),
  getPlayersID       = require('./get_players_id');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(result, isTimeout) { result = result || {}; isTimeout = isTimeout || false;

  var player = randomPlayer(this.gRoom, null, null, this.gPrisoner);
  if(!player) {
    return this.stop();
  }
  this.gNextGame = constants.G_START;

  this.gActivePlayers = {};
  this.gActionsQueue = {};


  activateAllPlayers(this.gRoom, this.gActivePlayers, null, this.gPrisoner);

  setActionsLimit(this, 1);

  var countPrisoners = (this.gPrisoner === null)? 0 : 1;

  this.gActionsCount = this.gRoom.girls_count + this.gRoom.guys_count - countPrisoners;

  result.next_game = this.gNextGame;
  result.players = getPlayersID(this.gActivePlayers);
  result.prison = null;
  if(this.gPrisoner !== null) {
    result.prison = {
      id : this.gPrisoner.id,
      vid: this.gPrisoner.vid,
      sex: this.gPrisoner.sex
    }
  }

  this.emit(player.getSocket(), result);
  this.gameState = result;

  var timeout = (isTimeout)? constants.TIMEOUT_RESULTS : 0;
  this.gTimer = startTimer(this.gHandlers[this.gNextGame], timeout);
};