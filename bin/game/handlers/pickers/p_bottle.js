/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const constants = require('./../../../constants');
const oPool = require('./../../../objects_pool');

module.exports = function (game) {
  return function (socket, options) {
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(constants.G_BOTTLE, constants.GT_FIN)(game);
    }
  }
};