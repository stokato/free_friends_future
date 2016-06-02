
module.exports = function(player) {
  var playerInfo = {};
  playerInfo.id = player.getID();
  playerInfo.vid = player.getVID();
  playerInfo.sex = player.getSex();
  playerInfo.socketId = player.getSocket().id;
  playerInfo.index = player.getGameIndex();
  playerInfo.player = player;
  return playerInfo;
};