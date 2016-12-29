/**
 * Получаем список комнат со свободными местами для нашего пола
 *
 * @param socket, options, callback
 * @return {Object} - объект со списком комнат
 */
const constants  = require('./../../../constants');
const oPool = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  let sex = oPool.userList[socket.id].getSex();
  
  let resRooms = [];
  
  let selfRoom = oPool.roomList[socket.id];
  
  for(let item in oPool.rooms) if(oPool.rooms.hasOwnProperty(item)) {
    if (oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM
                      && oPool.rooms[item].getName() != selfRoom.getName()) {
      
      let  info = oPool.rooms[item].getInfo();
      resRooms.push(info);
    }
  }
  
  let res = { [constants.PFIELDS.ROOMS] : resRooms };
  
  emitRes(null, socket, constants.IO_GET_ROOMS, res);
};
