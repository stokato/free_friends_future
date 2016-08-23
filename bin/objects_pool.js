
function ObjectsPool () {
  this.userList = {};                                  // Профили пользователей по сокетам
  this.roomList = {};                                  // Комнаты по сокетам
  this.rooms    = {};                                  // Комнаты по их именам
  this.profiles = {};                                  // Профили пользователей по id (надо бы убрать)
}

var oPool = new ObjectsPool();

module.exports = oPool;