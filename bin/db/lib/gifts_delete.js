var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Удалить все подарки игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
 - По каждому найденному подарку выполняем запрос на его удаления (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }

  // Отбираем все подарки
  var fields = ["id", "userid"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, ["userid"], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    // Удаляем их
    var params = [];
    var constValues = result.rows.length;

    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i]);
    }

    var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERGIFTS, ["id"], [constValues]);
    self.client.execute(query, [params], { prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
    });
  });
};