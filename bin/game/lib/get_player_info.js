/**
 * Получить информацию по игроку
 *
 */

module.exports = function(playerProfile) {
  return {
    id        : playerProfile.getID(),
    vid       : playerProfile.getVID(),
    sex       : playerProfile.getSex(),
    socketId  : playerProfile.getSocket().id,
    index     : playerProfile.getGameIndex(),
    player    : playerProfile
  };
};