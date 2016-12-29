/**
 * Пул объектов:
 * - список пользователей по ид сокета,
 * - список пользователей по их ид
 * - список комнат по именам
 * - список комнат по ид сокета
 * - список ид пользователей - которым запрещен лайк профилей
 * - список ид пользователей - которым запрещена смена комнаты
 *
 * Синглет
 *
 */
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

let oPool = new ObjectsPool();

module.exports = oPool;