/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 */

const oPool     = require('./../../../objects_pool');

module.exports = function (game) {
  return function(socket, options) {
  
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.getHandler(game.CONST.G_LOT, game.CONST.GT_FIN)(game);
    }
  }
};