var dbjs      = require('./../../db/index'),
  GameError = require('./../../game_error'),
  checkInput = require('./../../check_input');

var db = new dbjs();
/*
 Получить магазин с подарками
 - Получаем все возможные подарки из базы
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on('get_gift_shop', function() {
    if (!checkInput('get_gift_shop', socket, userList, null))
      return new GameError(socket, "GETGIFTSHOP", "Верификация не пройдена");

    db.findAllGoods(function (err, goods) {
      if (err) { return new GameError(socket, "GETGIFTSHOP", err.message); }

      socket.emit('get_gift_shop', goods);
    });
  });
};


