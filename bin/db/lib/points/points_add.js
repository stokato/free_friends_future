const async     = require('async');

const logger    = require('./../../../../lib/log')(module);
const dbCtrlr   = require('./../common/cassandra_db');
const Config    = require('./../../../../config.json');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Добавить очки игрока в БД: объект с ид, вид и количеством очков
 - Проверка (все поля обязательны)
 - Добавляем запись
 - Удаляем старые записи
 - Добавляем запись в таблицу по полу
 - Удаляем и от туда старые записи
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  
  const DBF  = DB_CONST.POINTS.fields;
  const DBN  = DB_CONST.POINTS.name;
  
  const DBFGUY = DB_CONST.POINTS_GUYS.fields;
  const DBNGUY = DB_CONST.POINTS_GUYS.name;
  
  const DBFGIRL = DB_CONST.POINTS_GIRLS.fields;
  const DBNGIRL = DB_CONST.POINTS_GIRLS.name;
  
  const POINTS_ID = "max";
  const GIRL = Config.user.constants.sex.female;

  if ( !options[PF.ID] ||
      !options[PF.VID] ||
      !options[PF.POINTS] ||
      !options[PF.SEX]) {
    return callback(new Error("Не указан ИД, ВИД, пол или количество очков игрока"), null);
  }
  
  let self = this;

  async.waterfall([//------------------------------------------------------------------
    function (cb) { // Обновляем таблицу пользователя
      
      let paramsArr = {
        [PF.ID]     : options[PF.ID],
        [PF.VID]    : options[PF.VID],
        [PF.POINTS] : options[PF.POINTS]
      };

  
      self.updateUser(paramsArr, (err) => {
        if (err) {
          return cb(err, null);
        }
    
        cb(null, null);
      });
    }, //------------------------------------------------------------------------
    function(res, cb) { // Добавляем новую запись в таблицу
      
      let fieldsArr = [
        DBF.ID_varchar_p,
        DBF.POINTS_c_desc,
        DBF.USERID_uuid,
        DBF.USERVID_varchar,
        DBF.SEX_int,
        DBF.UID_uuid_i
      ];
  
      let paramsArr = [
        POINTS_ID,
        options[PF.POINTS],
        options[PF.ID],
        options[PF.VID],
        options[PF.SEX],
        options[PF.ID]
      ];
        
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
      
      dbCtrlr.client.execute(query, paramsArr, {prepare: true },  (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, fieldsArr, paramsArr);
      });
    }, //------------------------------------------------------------------
    function(fieldsArr, paramsArr, cb) { // Удаляем все страные записи с очками
      delOldPoints(fieldsArr, DBN, (err) => {
        if(err) {
          return cb(err, null);
        }
        
        cb(null, fieldsArr, paramsArr);
      });
    }, //------------------------------------------------------------------
    function(fieldsArr, paramsArr, cb) { // Повторяем вставку для таблицы его пола

      let dbName = (options[PF.SEX] == GIRL)? DBNGIRL : DBNGUY;
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, dbName);

      dbCtrlr.client.execute(query, paramsArr, {prepare: true },  (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, fieldsArr, paramsArr);
      });
    }, //------------------------------------------------------------------
    function(fieldsArr, paramsArr, cb) { // Удаляем старые записи
      let db = (options[PF.SEX] == GIRL)? DBNGIRL : DBNGUY;

      delOldPoints(fieldsArr, db, (err) => {
        if(err) {
          return cb(err, null);
        }
        
        cb(null, null);
      });
    } //------------------------------------------------------------------
  ], function(err) {
    if(err) {
      callback(err, null);
    }

    callback(null, options);
  });
  
  //------------------------------------------------------------------
  function delOldPoints(fieldsArr, dbName, callback) { // Удаляем старые записи
    
    let condFieldsArr = [DBF.UID_uuid_i];
    let confValuesArr = [1];
    
    let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, dbName, condFieldsArr, confValuesArr);
    
    let paramsArr = [options[PF.ID]];
    
    dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
      if (err) {
        return callback(err);
      }
      
      result.rows.sort( (user1, user2) => {
        return user2[DBF.POINTS_c_desc] - user1[DBF.POINTS_c_desc];
      });
      
      let paramsArr = [POINTS_ID];
      
      let rowsLen = result.rows.length;
      for(let i = 1; i < rowsLen; i++) {
        paramsArr.push(result.rows[i][DBF.POINTS_c_desc]);
      }
  
      let condFieldsArr = [DBF.ID_varchar_p, DBF.POINTS_c_desc];
      let condValuesArr = [1, paramsArr.length-1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], dbName, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
        if (err) {
          logger.error(400, "Ошибка при удалениии старых очков: " +err.message + " из таблицы " + dbName);
          return callback(err, null);
        }
        
        callback(null, null);
      });
      
    });
  }
  
};

