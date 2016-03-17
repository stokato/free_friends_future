var C = require('../constants');
var buildQuery = require('./build_query');
/*
 Удалить всех друзей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех друзей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var f = C.IO.FIELDS;

  var query = buildQuery.build(buildQuery.Q_DELETE, [], C.T_USERFRIENDS, [f.userid], [1]);
  this.client.execute(query, [uid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};