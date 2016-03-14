var gamejs = require('../../game');
/*
 Создать новую комнату
 */
var countRoom = 0;                                  // Счетчки комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function (socket, userList) {
  var name = "Room" + (++countRoom);
  var newRoom =  {
    name: name , // Как-нибудь генерируем новое имя (????)
    guys: {},
    guys_count: 0,
    girls: {},
    girls_count: 0,
    messages: [],
    game : null
  };
  newRoom.game = new gamejs(socket, newRoom, userList);
  return newRoom;
};

