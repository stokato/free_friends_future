const async = require('async');

const dbCtrlr   = require('./../common/cassandra_db');
const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const DB_CONST  = require('./../../constants');

/*
 Удалить очки пользователя
 - Проверка на ИД, и пол очков
 - Строим и выполняем запрос на удаление
 - Возвращаем опции обратно
 */
module.exports = function(options, callback) { options = options || {};
  
  const DBF  = DB_CONST.POINTS.fields;
  const DBN  = DB_CONST.POINTS.name;
  const GIRL = Config.user.constants.sex.female;
  const POINTS_ID = "max";
  const DBNGIRLS  = DB_CONST.POINTS_GIRLS.name;
  const DBNGUYS   = DB_CONST.POINTS_GUYS.name;
  
  if (!options[PF.ID] || !options[PF.SEX]) {
    return callback(new Error("Задан пустой Id игрока или пол"));
  }

  async.waterfall([ //----------------------------------------------------
    function(cb) { // Удаляем записи этого пользователя
      let condFieldsArr = [DBF.ID_varchar_p, DBF.POINTS_c_desc, DBF.USERID_uuid];
      let condValuesArr = [1, 1, 1];
      let paramsArr = [POINTS_ID, options[PF.POINTS], options[PF.ID]];
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
      
      dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, paramsArr, condFieldsArr, condValuesArr);
      });
    }, //----------------------------------------------------------------
    function(paramsArr, condFieldsArr, condValuesArr, cb) { // Удаляем записи из таблицы его пола
      let dbName = (options[PF.SEX] == GIRL)? DBNGIRLS : DBNGUYS;

      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], dbName, condFieldsArr, condValuesArr);
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, options);
      });
    }
  ], //--------------------------------------------------------------------
    function(err, res) {
    if(err) {
      callback(err, null);
    }

    callback(null, options);
  });

};