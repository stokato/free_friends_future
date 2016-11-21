var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, friendsID, isSelf, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([
      function (cb) {
        if(isSelf) {
          var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT,
            ["friendid"], constants.T_USER_NEW_FRIENDS, ["userid"], [1]);
  
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
    
            var newIds = [];
    
            for(var i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i].friendid);
            }
    
            cb(null, newIds);
          });
        } else { cb(null, [])}
      },
      function (newIds, cb) {
        var constFields = ["userid"];
        var constCount = [1];
        var params = [uid];
  
        if(friendsID) {
          constFields.push("friendid");
          constCount.push(friendsID.length);
    
          for(var i = 0; i < friendsID.length; i++) {
            params.push(friendsID[i]);
          }
        }
  
        var fields = ["friendid", "friendvid", "date"];
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERFRIENDS, constFields, constCount);
  
        // Отбираем всех друзей или по списку friendsID
        cdb.client.execute(query, params, {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
    
          var friends = [];
          var friend = null;
          var friendList = [];
          var constValues = 0;
    
          if(result.rows.length > 0) {
            var i, rowsLen = result.rows.length;
            constValues = rowsLen;
      
            for(i = 0; i < rowsLen; i++) {
              var row = result.rows[i];
        
              friend = {
                id    : row["friendid"].toString(),
                vid   : row["friendvid"],
                date  : row["date"]
              };
              
              if(isSelf) {
                friend.is_new = false;
  
                for(var nid = 0; nid < newIds.length; nid++) {
                  if(friend.id == newIds[nid]) {
                    friend.is_new = true;
                  }
                }
              }
        
              friends.push(friend);
              friendList.push(friend["id"].toString());
            }
            
            cb(null, friends, constValues, friendList, newIds.length);
          } else { cb(null, null, null, null, null); }
        });
      },
      function (friends, constValues, friendList, countNews, cb) {
        if(friends) {
          // Отбираем сведения по всем друзьям
          var fields = ["id", "vid", "age", "sex", "city", "country", "points"];
          var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, ["id"], [constValues]);
  
          cdb.client.execute(query, friendList, {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
    
            for(var i = 0; i < result.rows.length; i++) {
              var row = result.rows[i];
              var index, j;
              var friendsLen = friendList.length;
              for(j = 0; j < friendsLen; j++) {
                if(friendList[j] == row["id"].toString()) {
                  index = j;
                }
              }
              friends[index]["age"]     = row["age"];
              friends[index]["sex"]     = row["sex"];
              friends[index]["city"]    = row["city"];
              friends[index]["country"] = row["country"];
              friends[index]["points"]  = row["points"];
            }
    
            cb(null, { friends : friends, new_friends : countNews });
          });
        } else { cb(null, null); }
        
      }
    ],
    function (err, friends) {
      if(err) { return callback(err, null); }
      
      callback(null, friends);
    });
  
};