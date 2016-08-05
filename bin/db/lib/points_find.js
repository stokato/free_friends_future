var async = require('async');

var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти следующие 100 пользователей по набранным очкам
 - Проверка начального количества очков, если нет - берем с максимального
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(sex, callback) {
  var self = this;
  //var f = C.IO.FIELDS;

  var users = [];
  var fields = ["points", "userid", "uservid", "sex"];

  var db = C.T_POINTS;
  if(sex == C.IO.GIRL) {
    db = C.T_POINTS_GIRLS;
  } else if(sex == C.IO.GUY) {
    db = C.T_POINTS_GUYS;
  }

  var query = qBuilder.build(qBuilder.Q_SELECT, fields, db, null, null, null, null, null, C.POINTS_LIMIT);

  this.client.execute(query, [], {prepare: true }, function(err, result) {
    if (err) { return cb(err, null); }

    //var f = C.IO.FIELDS;

    var i, rows = result.rows;
    var counter = 1;
    for(i = 0; i < rows.length; i++) {
      var user = {};

      user["id"]      = rows[i]["userid"].toString();
      user["vid"]     = rows[i]["uservid"];
      user["points"]  = rows[i]["points"];
      user["sex"]     = rows[i]["sex"];

      //var user = rows[i];
      //user.userid = user.userid.toString();
      user.number     = counter++;
      users.push(user);
    }

    callback(null, users);
  });

};

//
//var async = require('async');
//
//var C = require('../constants');
//var qBuilder = require('./build_query');
///*
// Найти следующие 100 пользователей по набранным очкам
// - Проверка начального количества очков, если нет - берем с максимального
// - Строим запрос (все поля) и выполняем
// - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
// */
//
//module.exports = function(max, callback) {
//  var self = this;
//  var f = C.IO.FIELDS;
//
//  var users = [];
//  var fields = [f.hundreds, f.points, f.userid, f.uservid];
//  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERPOINTS, [f.hundreds], [1],
//    0, 0, f.points);
//
//  async.waterfall([ //////////////////////////////////////////////////////////////
//    function(cb) { // Если параметр не задан, берем из БД максимальную сотню
//      if(!max) {
//        var queryH = qBuilder.build(qBuilder.Q_SELECT, [f.hundred], C.T_MAX_HANDRED, null, null, null, null, null, 1);
//        self.client.execute(queryH,[], {prepare: true }, function(err, result) {
//          if (err) { return cb(err, null); }
//
//          if(result.rows.length == 0) { return cb(null, 0); }
//          var row = result.rows[0];
//
//          cb(null, row[f.hundred]);
//        });
//      } else {
//        cb(null, max);
//      }
//    },/////////////////////////////////////////////////////////////////////
//    function(max, cb) { // Получаем топ игроков
//      var hundred = Math.floor(max/100) * 100;
//      getNextHundred(self.client, query, hundred, users, max, cb);
//    } ////////////////////////////////////////////////////////////////////////
//  ], function(err, res) { // Обрабатываем ошибки, либо возвращаем результат
//    if(err) { return callback(err, null); }
//
//    callback(null, users);
//  });
//};
//
//// Рекурсивно читаем из базы пользователей до усановленного количества
//function getNextHundred(client, query, hundred, users, max, callback) {
//  client.execute(query, [hundred], {prepare: true }, function(err, result) {
//    if (err) { return cb(err, null); }
//
//    var f = C.IO.FIELDS;
//
//    var i, user, rows = result.rows;
//    for(i = 0; i < rows.length; i++) {
//      if(C.IO.TOP_USERS > users.length && rows[i][f.points] <= max) {
//        user = {};
//        user[f.id]      = rows[i][f.userid];
//        user[f.vid]     = rows[i][f.uservid];
//        user[f.points]  = rows[i][f.points];
//
//        users.push(user);
//      } else { break; }
//    }
//
//    if(C.IO.TOP_USERS == users.length || hundred-100 == 0) {
//      users.sort(comparePoints);
//      for(i = 0; i < users.length; i++) {
//        users[i].topNumber = i + 1;
//      }
//      callback(null, users);
//    } else {
//      getNextHundred(client, query, hundred-100, users, max, callback);
//    }
//  });
//}
//
//function comparePoints(user1, user2) {
//  return user2.points - user1.points;
//}
