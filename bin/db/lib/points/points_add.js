const async     = require('async');

const logger    = require('./../../../../lib/log')(module);
const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');

const Config    = require('./../../../../config.json');
const PF = require('./../../../const_fields');

const DBF     = DB_CONST.POINTS.fields;
const GIRL    = Config.user.constants.sex.female;

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
  if ( !options[PF.ID] || !options[PF.VID] || !options[PF.POINTS] || !options[PF.SEX]) {
    return callback(new Error("Не указан ИД, ВИД, пол или количество очков игрока"), null);
  }
  
  let self = this;

  async.waterfall([//------------------------------------------------------------------
    function (cb) { // Обновляем таблицу пользователя
      
      let params = {
        [PF.ID]     : options[PF.ID],
        [PF.VID]    : options[PF.VID],
        [PF.POINTS] : options[PF.POINTS]
      };

  
      self.updateUser(params, function(err) {
        if (err) {return cb(err, null); }
    
        cb(null, null);
      });
    }, //------------------------------------------------------------------------
    function(res, cb) { // Добавляем новую запись в таблицу
      let fields = [
        DBF.ID_varchar_p,
        DBF.POINTS_c_desc,
        DBF.USERID_uuid,
        DBF.USERVID_varchar,
        DBF.SEX_int,
        DBF.UID_uuid_i
      ];
  
      let params = [
        "max",
        options[PF.POINTS],
        options[PF.ID],
        options[PF.VID],
        options[PF.SEX],
        options[PF.ID]
      ];
        
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fields, DB_CONST.POINTS.name);
      
      dbCtrlr.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Отбираем все записи для этого пользователя
      delOldPoints(fields, DB_CONST.POINTS.name, function () {
        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Повтоярем вставку для таблицы его пола

      let db = (options[PF.SEX] == GIRL)?
                        DB_CONST.POINTS_GIRLS.name : DB_CONST.POINTS_GUYS.name;
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fields, db);

      dbCtrlr.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Удаляем старые записи
      let db = (options[PF.SEX] == GIRL)?
                        DB_CONST.POINTS_GIRLS.name : DB_CONST.POINTS_GUYS.name;

      delOldPoints(fields, db, function () {
        cb(null, null);
      });
    } ////////////////////////////////////////////////////////////////////////////////
  ], function(err) {
    if(err) { callback(err, null); }

    callback(null, options);
  });
  
  function delOldPoints(fields, db, cb) { // Удаляем старые записи
    
    let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, db, [DBF.UID_uuid_i], [1]);
    
    let paramsF = [options[PF.ID]];
    
    dbCtrlr.client.execute(query, paramsF, {prepare: true },  function(err, result) {
      if (err) {  return cb(err); }
      
      result.rows.sort(function (user1, user2) {
        return user2[DBF.POINTS_c_desc] - user1[DBF.POINTS_c_desc];
      });
      
      let paramsF = ["max"];
      for(let i = 1; i < result.rows.length; i++) {
        paramsF.push(result.rows[i][DBF.POINTS_c_desc]);
      }
  
      let constFields = [DBF.ID_varchar_p, DBF.POINTS_c_desc];
      let constValues = [1, paramsF.length-1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], db, constFields, constValues);
  
      
  
      dbCtrlr.client.execute(query, paramsF, {prepare: true }, function(err) {
        if (err) {  logger.error(400, "Ошибка при удалениии старых очков: " +err.message + " из таблицы " + db); }
        
        cb(null, null);
      });
      
    });
  }
  
};

