var C = require('../constants');
var qBuilder = require('./build_query');
var async = require('async');

/*
 Удалить очки пользователя
 - Проверка на ИД, количество очков
 - Строим и выполняем запрос на удаление
 - Возвращаем опции обратно
 */
module.exports = function(options, callback) { options = options || {};
  //var f = C.IO.FIELDS;
  var self = this;
  if (!options["userid"] || !options["sex"]) {
    return callback(new Error("Задан пустой Id игрока или пол"));
  }

  async.waterfall([
    function(cb) {
      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_POINTS, ["id", "points", "userid"], [1, 1, 1]);

      var params = ["max", options["points"], options["userid"]];


      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }


        cb(null, params);
      });
    },
    function(params, cb) {
      var db = (options["sex"] == C.IO.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;
      var query = qBuilder.build(qBuilder.Q_DELETE, [], db, ["id", "points", "userid"], [1, 1, 1]);
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