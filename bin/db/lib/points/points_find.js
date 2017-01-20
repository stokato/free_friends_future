const dbCtrlr   = require('./../common/cassandra_db');
const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const DB_CONST  = require('./../../constants');

/*
 Найти 100 пользователей по набранным очкам
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(sex, callback) {
  
  const DBN = DB_CONST.POINTS.name;
  const DBF = DB_CONST.POINTS.fields;
  
  const DBNGIRL = DB_CONST.POINTS_GIRLS.name;
  const DBNGUY  = DB_CONST.POINTS_GUYS.name;
  
  const GUY = Config.user.constants.sex.male;
  const GIRL = Config.user.constants.sex.female;
  
  let usersArr = [];
  
  let fieldsArr = [
    DBF.POINTS_c_desc,
    DBF.USERID_uuid,
    DBF.USERVID_varchar,
    DBF.SEX_int
  ];

  // Определяем - к какой таблице обращаться
  
  let dbName = DBN;
  
  if(sex == GIRL) {
    dbName = DBNGIRL;
  } else if(sex == GUY) {
    dbName = DBNGUY;
  }
  
  let topSize = Number(Config.user.settings.top_size);

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, dbName, null, null, null, null, null, topSize);

  // Получаем все пользователей, отсортированных по количеству очков
  dbCtrlr.client.execute(query, [], { prepare: true }, (err, result) => {
    if (err) {
      return cb(err, null);
    }
    
    let counter = 1;
    for(let i = 0; i < result.rows.length; i++) {
      let rowObj = result.rows[i];
      
      let userObj = {
        [PF.ID]      : rowObj[DBF.USERID_uuid].toString(),
        [PF.VID]     : rowObj[DBF.USERVID_varchar],
        [PF.POINTS]  : rowObj[DBF.POINTS_c_desc],
        [PF.SEX]     : rowObj[DBF.SEX_int]
      };

      // Добавляем номер
      userObj[PF.NUMBER]  = counter++;
      usersArr.push(userObj);
    }

    callback(null, usersArr);
  });
};
