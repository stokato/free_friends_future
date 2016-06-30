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

  var player = randomPlayer(this.gRoom, null, null, this.gPrisoners);
  if(!player) {
    return this.stop();
  }
  this.gNextGame = constants.G_START;

  this.gActivePlayers = {};
  this.gActionsQueue = {};

  //var playerInfo = getPlayerInfo(player);
  //this.gActivePlayers[playerInfo.id] = playerInfo;

  activateAllPlayers(this.gRoom, this.gActivePlayers, null, this.gPrisoners);

  setActionsLimit(this, 1);
  //this.gActionsCount = 1;
  this.gActionsCount = this.gRoom.girls_count + this.gRoom.guys_count - this.countPrisoners;

  //var result = {};
  result[f.next_game] = this.gNextGame;
  //result[f.players] = [{id: playerInfo.id, vid: playerInfo.vid}];
  result[f.players] = getPlayersID(this.gActivePlayers);


  /////////////////////
  var inPrison = null;

  for(var item in this.gPrisoners) if(this.gPrisoners.hasOwnProperty(item)) {
    if(this.gPrisoners[item]) {
      inPrison = {};
      inPrison.id = this.gPrisoners[item].id;
      inPrison.vid = this.gPrisoners[item].vid;
    }
  }

  result.prison = inPrison;
  ////////////////

  this.emit(player.getSocket(), result);
  this.gameState = result;

  //this.gHandlers.lot(null, player.getID());

  this.gTimer = startTimer(this.gHandlers[this.gNextGame]);
};