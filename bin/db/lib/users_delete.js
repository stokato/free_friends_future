var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */
module.exports = function(id, callback) {
  if (!id) { callback(new Error("Задан пустой Id")); }

  //var f = C.IO.FIELDS;

  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERS, ["id"], [1]);

  this.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};