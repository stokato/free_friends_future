const async = require('async');

const Config    = require('./../../../../config.json');
const PF = require('./../../../const_fields');
const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');

const GIRL = Config.user.constants.sex.female;
const DBF = DB_CONST.POINTS.fields;

/*
 Удалить очки пользователя
 - Проверка на ИД, и пол очков
 - Строим и выполняем запрос на удаление
 - Возвращаем опции обратно
 */
module.exports = function(options, callback) { options = options || {};

  if (!options[PF.ID] || !options[PF.SEX]) {
    return callback(new Error("Задан пустой Id игрока или пол"));
  }

  async.waterfall([ //----------------------------------------------------
    function(cb) { // Удаляем записи этого пользователя
      let constFields = [DBF.ID_varchar_p, DBF.POINTS_c_desc, DBF.USERID_uuid];
      let constValues = [1, 1, 1];

      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DB_CONST.POINTS.name, constFields, constValues);

      let params = ["max", options[PF.POINTS], options[PF.ID]];

      dbCtrlr.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }

        cb(null, params, constFields, constValues);
      });
    }, //----------------------------------------------------------------
    function(params, constFields, constValues, cb) { // Удаляем записи из таблицы его пола
      let db = (options[PF.SEX] == GIRL)? DB_CONST.POINTS_GIRLS.name : DB_CONST.POINTS_GUYS.name;

      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], db, constFields, constValues);
      dbCtrlr.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }

        cb(null, options);
      });
    }
  ], //--------------------------------------------------------------------
    function(err, res) {
    if(err) { callback(err, null); }

    callback(null, options);
  });

};