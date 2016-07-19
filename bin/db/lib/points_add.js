var C = require('../constants');
var qBuilder = require('./build_query');
var async = require('async');
/*
 Добавить очки игрока в БД: объект с ид, вид и количеством очков
 - Проверка (все поля обязательны)
 - Определяем сотню
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  var self = this;
  var f = C.IO.FIELDS;

  if ( !options[f.userid] || !options[f.uservid] || !options[f.points] || !options[f.sex]) {
    return callback(new Error("Не указан ИД, ВИД, пол или количество очков игрока"), null);
  }

  async.waterfall([
    function(cb) {
      var fields = [f.id, f.points, f.userid, f.uservid, f.sex, f.uid];
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_POINTS);

      var params = ["max", options[f.points], options[f.userid], options[f.uservid], options[f.sex], options[f.userid]];

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    },
    function(fields, params, cb) {
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_POINTS, [f.uid], [1]);

      var paramsF = [options[f.userid]];

      self.client.execute(query, paramsF, {prepare: true },  function(err, result) {
        if (err) {  return cb(err); }

        result.rows.sort(comparePoints);

        for(var i = 1; i < result.rows.length; i++) {
          var points = result.rows[i][f.points];
          var userid = result.rows[i][f.userid];

          var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_POINTS, [f.id, f.points, f.userid], [1, 1, 1]);

          var paramsD = ["max", points, userid];

          self.client.execute(query, paramsD, {prepare: true }, function(err) {
            if (err) {  console.log("Ошибка при удалениии старых очков: " +err.message) }

            //cb(null, params);
          });
        }

        cb(null, fields, params);
      });
    },
    function(fields, params, cb) {

      var db = (options[f.sex] == C.IO.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, db);

      self.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }

        cb(null, fields, params);
      });
    },
    function(fields, params, cb) {
      var db = (options[f.sex] == C.IO.GIRL)? C.T_POINTS_GIRLS : C.T_POINTS_GUYS;

      var query = qBuilder.build(qBuilder.Q_SELECT, fields, db, [f.uid], [1]);

      var paramsF = [options[f.userid]];

      self.client.execute(query, paramsF, {prepare: true },  function(err, result) {
        if (err) {  return cb(err); }

        result.rows.sort(comparePoints);

        for(var i = 1; i < result.rows.length; i++) {
          var points = result.rows[i][f.points];
          var userid = result.rows[i][f.userid];

          var query = qBuilder.build(qBuilder.Q_DELETE, [], db, [f.id, f.points, f.userid], [1, 1, 1]);

          var paramsF = ["max", points, userid];

          self.client.execute(query, paramsF, {prepare: true }, function(err) {
            if (err) {  console.log("Ошибка при удалениии старых очков: " +err.message) }

            //cb(null, params);
          });
        }

        cb(null, null);
      });
    }
  ], function(err, res) {
    if(err) { callback(err, null); }

    callback(null, options);
  })
};

function comparePoints(user1, user2) {
  return user2.points - user1.points;
}

//function deletePoints(points, pos) {
//  var f = C.IO.FIELDS;
//
//  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_POINTS, [f.id, f.points, f.userid], [1, 1, 1]);
//
//  var params = ["max", options[f.points], options[f.userid]];
//
//
//  self.client.execute(query, params, {prepare: true }, function(err) {
//    if (err) {  return cb(err); }
//
//
//    if(points.rows)
//  });
//}

//
//var C = require('../constants');
//var qBuilder = require('./build_query');
///*
// Добавить очки игрока в БД: объект с ид, вид и количеством очков
// - Проверка (все поля обязательны)
// - Определяем сотню
// - Строим и выполняем запрос
// - Возвращаем объект обратно
// */
//module.exports = function(options, callback) { options    = options || {};
//  var self = this;
//  var f = C.IO.FIELDS;
//
//  if ( !options[f.userid] || !options[f.uservid] || !options[f.points]) {
//    return callback(new Error("Не указан ИД, ВИД или количество очков игрока"), null);
//  }
//
//  var hundred = Math.floor(options[f.points]/100) * 100 + 100;
//
//  var fields = [f.hundreds, f.points, f.userid, f.uservid];
//  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERPOINTS);
//
//  var params = [hundred, options[f.points], options[f.userid], options[f.uservid]];
//
//  self.client.execute(query, params, {prepare: true },  function(err) {
//    if (err) {  return callback(err); }
//
//    var query = qBuilder.build(qBuilder.Q_INSERT, [f.id, f.hundred], C.T_MAX_HANDRED);
//    self.client.execute(query, [hundred, hundred],{prepare: true },  function(err) {
//      if (err) {  return callback(err); }
//
//      callback(null, options);
//    });
//  });
//};
