var dbjs      = require('./../../db/index'),                // База
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    constants = require('./../constants');

var db = new dbjs();

/////////////////////////// ТОП ИГРОКОВ /////////////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем заданные поля из базы, (какие нужны ?)
 - Сортируем по очкам
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_TOP, function() {
    if (!checkInput(constants.IO_GET_TOP, socket, userList, null))  { return; }

    var fList = [constants.FIELDS.sex, constants.FIELDS.points];
    db.findAllUsers(fList, function (err, users) {
      if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }

      users.sort(comparePoints);

      socket.emit(constants.IO_GET_TOP, users);
    });
  });
};

// Для сортировки массива игроков (получение топа по очкам)
function comparePoints(userA, userB) {
  var points = constants.FIELDS.points;
  return userB[points] - userA[points];
}


