 getPlayerInfo  = require('./get_player_info');

// Собрать в массив индексты очереди всех игроков указанного пола
module.exports = function (room, currIndex, getGuy) {
  var arr = [], item, player;

  var players = (getGuy)? room.guys : room.girls;

  for(item in players) if(players.hasOwnProperty(item)) {
    player = players[item];
    arr.push({ player : player, index : player.getGameIndex()});
  }

  arr.sort(compareIndex);

  for(var i = 0; i < arr.length; i++) {
    if(arr[i].index > currIndex) {
      return getPlayerInfo(arr[i].player);
    }
  }

  return getPlayerInfo(arr[0].player);
};

function compareIndex(player1, player2) {
  return player1.index - player2.index;
}