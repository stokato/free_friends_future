/**
 * Получаем список комнат со свободными местами для нашего пола
 *
 * @param socket, options, callback
 * @return {Object} - объект со списком комнат
 */
var constants  = require('./../../../constants');
var oPool = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {
  
  var sex = oPool.userList[socket.id].getSex();
  
  var resRooms = [];
  
  var selfRoom = oPool.roomList[socket.id];
  
  for(var item in oPool.rooms) if(oPool.rooms.hasOwnProperty(item)) {
    if (oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM
                      && oPool.rooms[item].getName() != selfRoom.getName()) {
      
      var info = oPool.rooms[item].getInfo();
      resRooms.push(info);
    }
  }
  
  var res = {};
  res[constants.PFIELDS.ROOMS] = resRooms;
  
  callback(null, res);
};
