var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.POINTS.fields;
var PF = dbConst.PFIELDS;

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
      var constFields = [DBF.ID_varchar_p, DBF.POINTS_c_desc, DBF.USERID_uuid];
      var constValues = [1, 1, 1];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.POINTS.name, constFields, constValues);

      var params = ["max", options[PF.POINTS], options[PF.ID]];

      cdb.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }

        cb(null, params, constFields, constValues);
      });
    }, //----------------------------------------------------------------
    function(params, constFields, constValues, cb) { // Удаляем записи из таблицы его пола
      var db = (options[PF.SEX] == constants.GIRL)? dbConst.DB.POINTS_GIRLS.name : dbConst.DB.POINTS_GUYS.name;

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], db, constFields, constValues);
      cdb.client.execute(query, params, {prepare: true }, function(err) {
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