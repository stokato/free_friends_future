/*
 Создать новую комнату
 */
var countRoom = 0;                                  // Счетчки комнат (сейчас нужен для генерации идентификатора окна)

module.exports = function () {
  var name = "Room" + (++countRoom);
  return  {
    name: name , // Как-нибудь генерируем новое имя (????)
    guys: {},
    guys_count: 0,
    girls: {},
    girls_count: 0,
    messages: []//,
    //game : new gamejs(socket, newRoom)
  };
};

