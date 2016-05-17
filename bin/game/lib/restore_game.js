var constants = require('../constants');
var constants_io = require('../../io/constants');

var randomPlayer = require('./random_player'),
  startTimer         = require('./start_timer'),
    setActionsLimit = require('./set_action_limits');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function() {
  var f = constants_io.FIELDS;
  var player = randomPlayer(this.gRoom, null);
  this.gNextGame = constants.G_LOT;

  this.gActivePlayers = {};
  this.gActionsQueue = {};

  this.gActivePlayers[player.getID()] = player;

  setActionsLimit(this, 1);
  this.gActionsCount = 1;

  var result = {};
  result[f.next_game] = this.gNextGame;
  result[f.players] = [{id: player.getID(), vid: player.getVID()}];

  this.emit(player.getSocket(), result);
  this.gameState = result;

  //this.gHandlers.lot(null, player.getID());

  this.gTimer = startTimer(this.gHandlers[this.gNextGame]);
};