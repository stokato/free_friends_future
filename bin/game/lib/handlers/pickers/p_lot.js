/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const oPool     = require('./../../../../objects_pool');
const addAction = require('./../../common/add_action');
const finishLot = require('./../finishers/f_lot');

module.exports = function(game) {
  return function(socket, options) {
  
    let uid = oPool.userList[socket.id].getID();
  
    if (!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
    
    if(game._actionsCount == 0) {
      finishLot(false, socket, game);
    }
  }
};
