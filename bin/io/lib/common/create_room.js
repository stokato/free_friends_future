/**
 * Создаем комнату
 *
 * @return room
 */

let  Config     = require('./../../../../config.json');
let  PF         = require('./../../../const_fields');
let  Room       = require('./../../../room/index');
let  countRoom  = 0;    // Счетчики комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  let  name    = PF.ROOM + (++countRoom);
  let  title   = Config.io.room_title_tmp + countRoom;
  
  return new Room(name, title);
};
