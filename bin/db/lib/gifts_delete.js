var C = require('../constants');
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

  var f = C.IO.FIELDS;

  var fields = [f.id, f.userid];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, [f.userid], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }


    var params = [];
    var i;
    var rowsLen = result.rows.length;
    var const_fields = rowsLen;
    for (i = 0; i < rowsLen; i ++) {
      params.push(result.rows[i]);
    }

    var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERGIFTS, [f.id], [const_fields]);
    self.client.execute(query, [params], { prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, uid);
    });
  });
};