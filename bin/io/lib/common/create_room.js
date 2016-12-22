/**
 * Создаем комнату
 *
 * @return room
 */

var constants = require('./../../../constants');
var Room = require('./../../../room/index');
var addRankHandlers = require('./../ranks/add_rank_handlers');

/*
 Создать новую комнату
 */
var countRoom = 0;    // Счетчики комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  var name = "Room" + (++countRoom);
  var title = "Комната № " + countRoom;
  
  var newRoom = new Room(name, title);
  
  var ranks = newRoom.getRanks();
  addRankHandlers(ranks);
  
  return newRoom;
};
