
module.exports = function(player) {
  var playerInfo = {};
  playerInfo.id = player.getID();
  playerInfo.vid = player.getVID();
  playerInfo.sex = player.getSex();
  playerInfo.player = player;
  return playerInfo;
};