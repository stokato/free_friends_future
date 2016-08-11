// Получить информацию по игроку
module.exports = function(player) {
  return {
    id        : player.getID(),
    vid       : player.getVID(),
    sex       : player.getSex(),
    socketId  : player.getSocket().id,
    index     : player.getGameIndex(),
    player    : player
  };
};