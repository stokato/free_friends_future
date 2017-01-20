/**
 * Получаем список комнат со свободными местами для нашего пола
 *
 * @param socket, options, callback
 * @return {Object} - объект со списком комнат
 */

const Config  = require('./../../../../config.json');
const PF      = require('./../../../const_fields');
const oPool   = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');

module.exports = function (socket, options) {
  
  let ONE_SEX_IN_ROOM  = Config.io.one_sex_in_room;
  
  let sex = oPool.userList[socket.id].getSex();
  
  let resRoomsArr = [];
  
  let selfRoom = oPool.roomList[socket.id];
  
  for(let item in oPool.rooms) if(oPool.rooms.hasOwnProperty(item)) {
    let room = oPool.rooms[item];
    if (room.getCountInRoom(sex) < ONE_SEX_IN_ROOM && room.getName() != selfRoom.getName()) {
      
      let  infoObj = oPool.rooms[item].getInfo();
      resRoomsArr.push(infoObj);
    }
  }
  
  emitRes(null, socket, Config.io.emits.IO_GET_ROOMS, { [PF.ROOMS] : resRoomsArr });
};
