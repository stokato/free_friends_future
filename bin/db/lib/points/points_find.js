const Config    = require('./../../../../config.json');
const PF = require('./../../../const_fields');
const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');

const DBF = DB_CONST.POINTS.fields;
const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;

/*
 Найти 100 пользователей по набранным очкам
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(sex, callback) {
  let users = [];
  let fields = [
    DBF.POINTS_c_desc,
    DBF.USERID_uuid,
    DBF.USERVID_varchar,
    DBF.SEX_int
  ];

  // Определяем - к какой таблице обращаться
  let db = DB_CONST.POINTS.name;
  if(sex == GIRL) {
    db = DB_CONST.POINTS_GIRLS.name;
  } else if(sex == GUY) {
    db = DB_CONST.POINTS_GUYS.name;
  }
  
  let topSize = Number(Config.user.settings.top_size);

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, db, null, null, null, null, null, topSize);

  // Получаем все пользователей, отсортированных по количеству очков
  dbCtrlr.client.execute(query, [], {prepare: true }, function(err, result) {
    if (err) { return cb(err, null); }

    let user, row;
    let counter = 1;
    for(let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      user = {
        [PF.ID]      : row[DBF.USERID_uuid].toString(),
        [PF.VID]     : row[DBF.USERVID_varchar],
        [PF.POINTS]  : row[DBF.POINTS_c_desc],
        [PF.SEX]     : row[DBF.SEX_int]
      };

      // Добавляем номер
      user[PF.NUMBER]  = counter++;
      users.push(user);
    }

    callback(null, users);
  });
};
