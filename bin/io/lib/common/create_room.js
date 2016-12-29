/**
 * Создаем комнату
 *
 * @return room
 */

const constants = require('./../../../constants');

let  Room       = require('./../../../room/index');
let  countRoom  = 0;    // Счетчики комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  let  name   = "Room" + (++countRoom);
  let  title  = "Комната № " + countRoom;
  
  return new Room(name, title);
};
