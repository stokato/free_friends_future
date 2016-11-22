var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF = require('./../../constants').PFIELDS;

var logger = require('./../../../../lib/log')(module);

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
  
  var self = this;

  async.waterfall([//////////////////////////////////////////////////////////////////
    function (cb) { // Обновляем таблицу пользователя
      var params = {
        id      : options[PF.ID],
        vid     : options[PF.VID],
        points  : options[PF.POINTS]
      };
  
      self.updateUser(params, function(err) {
        if (err) {return cb(err, null); }
    
        cb(null, null);
      });
    }, //////////////////////////////////////////////////////////////////////////////////
    function(res, cb) { // Добавляем новую запись в таблицу
      var fields = ["id", "points", "userid", "uservid", "sex", "uid"];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_POINTS);

      var params = ["max", options[PF.POINTS], optionss[PF.ID], options[PF.VID], options[PF.SEX], options[PF.ID]];

      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Отбираем все записи для этого пользователя
      delOldPoints(fields, constants.T_POINTS, function () {
        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Повтоярем вставку для таблицы его пола

      var db = (options[PF.SEX] == constants.GIRL)? constants.T_POINTS_GIRLS : constants.T_POINTS_GUYS;
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, db);

      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Удаляем старые записи
      var db = (options[PF.SEX] == constants.GIRL)? constants.T_POINTS_GIRLS : constants.T_POINTS_GUYS;

      delOldPoints(fields, db, function () {
        cb(null, null);
      });
    } ////////////////////////////////////////////////////////////////////////////////
  ], function(err, res) {
    if(err) { callback(err, null); }

    callback(null, options);
  });
  
  function delOldPoints(fields, db, cb) { // Удаляем старые записи
    
    var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, db, ["uid"], [1]);
    
    var paramsF = [options[PF.ID]];
    
    cdb.client.execute(query, paramsF, {prepare: true },  function(err, result) {
      if (err) {  return cb(err); }
      
      result.rows.sort(function (user1, user2) {
        return user2.points - user1.points;
      });
      
      for(var i = 1; i < result.rows.length; i++) {
        var points = result.rows[i]["points"];
        var userid = result.rows[i]["userid"];
        
        var constFields = ["id", "points", "userid"];
        var constValues = [1, 1, 1];
        
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], db, constFields, constValues);
        
        var paramsF = ["max", points, userid];
        
        cdb.client.execute(query, paramsF, {prepare: true }, function(err) {
          if (err) {  logger.error(400, "Ошибка при удалениии старых очков: " +err.message + " из таблицы " + db); }
          
          //cb(null, params);
        });
      }
      
      cb(null, null);
    });
  }
  
};

