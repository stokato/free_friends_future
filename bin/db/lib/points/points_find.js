const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');
const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');

const DBF = dbConst.POINTS.fields;
const PF  = constants.PFIELDS;
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
  let db = dbConst.POINTS.name;
  if(sex == GIRL) {
    db = dbConst.POINTS_GIRLS.name;
  } else if(sex == GUY) {
    db = dbConst.POINTS_GUYS.name;
  }
  
  let topSize = Number(Config.user.settings.top_size);

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, db, null, null, null, null, null, topSize);

  // Получаем все пользователей, отсортированных по количеству очков
  cdb.client.execute(query, [], {prepare: true }, function(err, result) {
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
