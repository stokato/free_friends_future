var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.POINTS.fields;
var PF = dbConst.PFIELDS;

/*
 Найти 100 пользователей по набранным очкам
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(sex, callback) {
  var users = [];
  var fields = [
    DBF.POINTS_c_desc,
    DBF.USERID_uuid,
    DBF.USERVID_varchar,
    DBF.SEX_int
  ];

  // Определяем - к какой таблице обращаться
  var db = dbConst.DB.POINTS.name;
  if(sex == constants.GIRL) {
    db = dbConst.DB.POINTS_GIRLS.name;
  } else if(sex == constants.GUY) {
    db = dbConst.DB.POINTS_GUYS.name;
  }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, db, null, null, null, null, null, constants.TOP_USERS);

  // Получаем все пользователей, отсортированных по количеству очков
  cdb.client.execute(query, [], {prepare: true }, function(err, result) {
    if (err) { return cb(err, null); }

    var user, row;
    var counter = 1;
    for(var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      user = {};
      user[PF.ID]      = rows[i][DBF.USERID_uuid].toString();
      user[PF.VID]     = rows[i][DBF.USERVID_varchar];
      user[PF.POINTS]  = rows[i][DBF.POINTS_c_desc];
      user[PF.SEX]     = rows[i][DBF.SEX_int];

      // Добавляем номер
      user[PF.NUMBER]  = counter++;
      users.push(user);
    }

    callback(null, users);
  });
};
