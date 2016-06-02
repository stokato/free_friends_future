var gamejs = require('../../game');
/*
 Создать новую комнату
 */
var countRoom = 0;    // Счетчки комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function (socket, userList) {
  var name = "Room" + (++countRoom);
  var newRoom =  {
    name: name , // Как-нибудь генерируем новое имя (????)
    guys: {},
    guys_count: 0,
    girls: {},
    girls_count: 0,
    messages: [],
    game : null,
    girls_counter : 1,
    guys_counter : 2
  };
  newRoom.game = new gamejs(newRoom, userList);
  return newRoom;
};

