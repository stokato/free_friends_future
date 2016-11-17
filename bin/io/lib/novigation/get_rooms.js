// Свои модули
var constants  = require('./../../../constants');

var oPool = require('./../../../objects_pool');

/*
 Показать список комнат (столов)
 - Получаем данные профиля
 - Узанем пол
 - Выбираем все комнаты со свободными местами для нашего пола и для каждой
 -- Получаем ее идентификтор и инфу по парням и девушкам
 - Передаем клиенту
 */
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
  
  callback(null, { rooms : resRooms });
};
