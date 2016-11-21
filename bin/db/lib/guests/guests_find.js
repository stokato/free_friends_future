var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, isSelf, callback) {

  if (!uid ) { return callback(new Error("Задан пустой Id"), null); }

  async.waterfall([
      function (cb) {
        if(isSelf) {
          var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT,
            ["guestid"], constants.T_USER_NEW_GUESTS, ["userid"], [1]);
  
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
    
            var newIds = [];
    
            for(var i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i].guestid);
            }
    
            cb(null, newIds);
          });
        } else { cb(null, []); }

      },
    function (newIds, cb) {
  
      // Отбираем всех гостей
      var fields = ["guestid", "guestvid", "date"];
      var constFields = ["userid"];
      var constValues = [1];
  
      //var query = "select guestid, guestvid, date FROM user_guests where userid = ?";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERGUESTS, constFields, constValues);
  
      cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
    
        var guests = [];
        var guestList = [];
        var i, rowsLen = result.rows.length;
  
        var constValues = [rowsLen];
    
        if(rowsLen > 0) {
          var row;
          for(i = 0; i < rowsLen; i++) {
            row = result.rows[i];
        
            var guest = {
              id    : row["guestid"].toString(),
              vid   : row["guestvid"],
              date  : row["date"]
            };
            
            if(isSelf) {
              guest.is_new = false;
  
              for(var nid = 0; nid < newIds.length; nid++) {
                if(guest.id == newIds[nid]) {
                  guest.is_new = true;
                }
              }
            }
        
            guests.push(guest);
            guestList.push(guest.id);
          }
      
          cb(null, guests, constValues, guestList, newIds.length)
        } else { return cb(null, null, null, null, null); }
      });
    },
    function (guests, constValues, guestList, countNews, cb) {
      if(guests) {
        // Отбираем сведения по всем гостям
        var fields = ["id", "vid", "age", "sex", "city", "country", "points"];
        var constFields = ["id"];
  
  
        //var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, constFields, constValues);
  
        cdb.client.execute(query, guestList, {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
    
          // Сопоставляем результаты
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i], index;
      
            for(var j = 0; j < guestList.length; j++) {
              if(guestList[j] == row["id"]) {
                index = j;
              }
            }
      
            guests[index]["age"]     = row["age"];
            guests[index]["sex"]     = row["sex"];
            guests[index]["city"]    = row["city"];
            guests[index]["country"] = row["country"];
            guests[index]["points"]  = row["points"];
          }
          cb(null, { guests : guests, new_guests : countNews });
        });
      } else { cb(null, null); }
    }
  ],
  function (err, guests) {
    if (err) { return callback(err, null); }
  
    callback(null, guests);
  });
  
};