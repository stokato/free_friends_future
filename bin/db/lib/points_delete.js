var C = require('../../constants');
var qBuilder = require('./build_query');
var async = require('async');

/*
 Удалить очки пользователя
 - Проверка на ИД, и пол очков
 - Строим и выполняем запрос на удаление
 - Возвращаем опции обратно
 */
module.exports = function(options, callback) { options = options || {};
  var self = this;
  if (!options["userid"] || !options["sex"]) {
    return callback(new Error("Задан пустой Id игрока или пол"));
  }

  async.waterfall([ ///////////////////////////////////////////////
    function(cb) { // Удаляем записи этого пользователя
      var constFields = ["id", "points", "userid"];
      var constValues = [1, 1, 1];

      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_POINTS, constFields, constValues);

      var params = ["max", options["points"], options["userid"]];

      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }


        cb(null, params, constFields, constValues);
      });
    }, ///////////////////////////////////////////////////////////
    function(params, constFields, constValues, cb) { // Удаляем записи из таблицы его пола
      var db = (options["sex"] == C.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;

      var query = qBuilder.build(qBuilder.Q_DELETE, [], db, constFields, constValues);
      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }

        cb(null, options);
      });
    }
  ], function(err, res) {
    if(err) { callback(err, null); }

    callback(null, options);
  } )

};