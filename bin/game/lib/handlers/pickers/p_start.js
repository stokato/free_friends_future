/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 */

const oPool     = require('../../../../objects_pool');

const addAction = require('../../common/add_action');
const finishStart = require('../finishers/f_start');

module.exports = function (game, result) {
  return function (socket, options) {
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    if(!game._actionsQueue[uid]) {
      game._actionsQueue[uid] = [];
    }
  
    addAction(game, uid, options);
  
    if(game._actionsCount == 0) {
      finishStart(false, socket, game);
    }
  }
};