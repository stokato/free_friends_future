/**
 * Создаем комнату
 *
 * @return room
 */

var constants = require('./../../../constants');
var Room = require('./../../../room/index');

/*
 Создать новую комнату
 */
var countRoom = 0;    // Счетчики комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  var name = "Room" + (++countRoom);
  
  return new Room(name);
};
