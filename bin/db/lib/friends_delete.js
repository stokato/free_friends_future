var C = require('../constants');
var buildQuery = require('./build_query');
/*
 Удалить всех друзей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех друзей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, fid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  //var f = C.IO.FIELDS;

  var fields = ["userid"];
  var constFields = [1];
  var params = [uid];

  if(fid) {
    fields.push(["friendid"]);
    constFields.push(1);
    params.push(fid);
  }

  var query = buildQuery.build(buildQuery.Q_DELETE, [], C.T_USERFRIENDS, fields, constFields);
  this.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};