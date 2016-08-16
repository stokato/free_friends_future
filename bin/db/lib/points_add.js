var C = require('../../constants');
var qBuilder = require('./build_query');
var async = require('async');
var logger = require('./../../../lib/log');

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
  var self = this;

  if ( !options["userid"] || !options["uservid"] || !options["points"] || !options["sex"]) {
    return callback(new Error("Не указан ИД, ВИД, пол или количество очков игрока"), null);
  }

  async.waterfall([//////////////////////////////////////////////////////////////////
    function(cb) { // Добавляем новую запись в таблицу
      var fields = ["id", "points", "userid", "uservid", "sex", "uid"];
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_POINTS);

      var params = ["max", options["points"], options["userid"], options["uservid"], options["sex"], options["userid"]];

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Отбираем все записи для этого пользователя
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_POINTS, ["uid"], [1]);

      var paramsF = [options["userid"]];

      self.client.execute(query, paramsF, {prepare: true },  function(err, result) {
        if (err) {  return cb(err); }

        result.rows.sort(comparePoints);

        // И удаляем все старые записи
        for(var i = 1; i < result.rows.length; i++) {
          var points = result.rows[i]["points"];
          var userid = result.rows[i]["userid"];

          var constFields = ["id", "points", "userid"];
          var constValues = [1, 1, 1];

          var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_POINTS, constFields, constValues);

          var paramsD = ["max", points, userid];

          self.client.execute(query, paramsD, {prepare: true }, function(err) {
            if (err) {  logger.error(400, "Ошибка при удалениии старых очков: " +err.message + " из таблицы " + C.T_POINTS); }

            //cb(null, params);
          });
        }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Повтоярем вставку для таблицы его пола

      var db = (options["sex"] == C.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, db);

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    }, //////////////////////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Удаляем старые записи
      var db = (options["sex"] == C.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;

      var query = qBuilder.build(qBuilder.Q_SELECT, fields, db, ["uid"], [1]);

      var paramsF = [options["userid"]];

      self.client.execute(query, paramsF, {prepare: true },  function(err, result) {
        if (err) {  return cb(err); }

        result.rows.sort(comparePoints);

        for(var i = 1; i < result.rows.length; i++) {
          var points = result.rows[i]["points"];
          var userid = result.rows[i]["userid"];

          var constFields = ["id", "points", "userid"];
          var constValues = [1, 1, 1];

          var query = qBuilder.build(qBuilder.Q_DELETE, [], db, constFields, constValues);

          var paramsF = ["max", points, userid];

          self.client.execute(query, paramsF, {prepare: true }, function(err) {
            if (err) {  logger.error(400, "Ошибка при удалениии старых очков: " +err.message + " из таблицы " + db); }

            //cb(null, params);
          });
        }

        cb(null, null);
      });
    } ////////////////////////////////////////////////////////////////////////////////
  ], function(err, res) {
    if(err) { callback(err, null); }

    callback(null, options);
  })
};

function comparePoints(user1, user2) {
  return user2.points - user1.points;
}
