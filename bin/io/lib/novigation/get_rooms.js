// Свои модули
var constants  = require('./../../../constants'),
    getRoomInfo = require('./../common/get_room_info');

var oPool = require('./../../../objects_pool');

/*
 Показать список комнат (столов)
 - Получаем данные профиля
 - Узанем пол
 - Выбираем все комнаты со свободными местами для нашего пола и для каждой
 -- Получаем ее идентификтор и инфу по парням и девушкам (какую ???)
 - Передаем клиенту
 */
module.exports = function (socket, options, callback) {
  
  var sex = oPool.userList[socket.id].getSex();
  
  var resRooms = [];
  var count = 1;
  
  var selfRoom = oPool.roomList[socket.id];
  
  for(var item in oPool.rooms) if(oPool.rooms.hasOwnProperty(item)) {
    if (oPool.rooms[item].getCountInRoom(sex) < constants.ONE_SEX_IN_ROOM && oPool.rooms[item].name != selfRoom.name) {
      
      count++;
      getRoomInfo(oPool.rooms[item], function (err, info) {
        if (err) { return callback(options, err.message); }
        
        resRooms.push(info);
        
        checkComplete();
      });
      
    }
  }
  
  checkComplete();
  
  //-------------------------
  function checkComplete() {
    count--;
    
    if(count == 0) {
      
      callback(null, { room : resRooms });
      
    }
  }
  
};
