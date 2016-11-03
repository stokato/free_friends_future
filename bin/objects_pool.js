
function ObjectsPool () {
  this.userList = {};                                  // Профили пользователей по сокетам
  this.roomList = {};                                  // Комнаты по сокетам
  this.rooms    = {};                                  // Комнаты по их именам
  this.profiles = {};                                  // Профили пользователей по id (надо бы убрать)
  this.likeLocks = {};                                 // Запреты на лайки id : [id, ...] - кто кого
  this.roomChangeLocks = {};
  this.isProfile = function (prifleID) {
    return !!this.profiles[prifleID];
  }
}

var oPool = new ObjectsPool();

module.exports = oPool;