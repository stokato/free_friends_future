var dbjs      = require('./../../db/index'),                // База
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input');

var db = new dbjs();

/////////////////////////// ТОП ИГРОКОВ /////////////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем заданные поля из базы, (какие нужны ?)
 - Сортируем по очкам
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on('get_top', function() {
    if (!checkInput('get_top', socket, userList, null))  {
      return new GameError(socket, "GETTOP", "Верификация не пройдена");
    }

    var fList = ["name", "gender", "points"];
    db.findAllUsers(fList, function (err, users) {
      if (err) { return new GameError(socket, "GETTOP", err.message); }

      users.sort(comparePoints);

      socket.emit('get_top', users);
    });
  });
};

// Для сортировки массива игроков (получение топа по очкам)
function comparePoints(userA, userB) {
  return userB.points - userA.points;
}


