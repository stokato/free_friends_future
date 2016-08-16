var async = require('async');

var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Найти 100 пользователей по набранным очкам
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(sex, callback) {
  var users = [];
  var fields = ["points", "userid", "uservid", "sex"];

  // Определяем - к какой таблице обращаться
  var db = C.T_POINTS;
  if(sex == C.GIRL) {
    db = C.T_POINTS_GIRLS;
  } else if(sex == C.GUY) {
    db = C.T_POINTS_GUYS;
  }

  var query = qBuilder.build(qBuilder.Q_SELECT, fields, db, null, null, null, null, null, C.TOP_USERS);

  // Получаем все пользователей, отсортированных по количеству очков
  this.client.execute(query, [], {prepare: true }, function(err, result) {
    if (err) { return cb(err, null); }

    var i, rows = result.rows;
    var counter = 1;
    for(i = 0; i < rows.length; i++) {
      var user = {};

      user["id"]      = rows[i]["userid"].toString();
      user["vid"]     = rows[i]["uservid"];
      user["points"]  = rows[i]["points"];
      user["sex"]     = rows[i]["sex"];

      //var user = rows[i];
      //user.userid = user.userid.toString();

      // Добавляем номер
      user.number     = counter++;
      users.push(user);
    }

    callback(null, users);
  });
};
