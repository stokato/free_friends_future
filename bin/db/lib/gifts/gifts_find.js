var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, isSelf, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null);}

  async.waterfall([ // Отбираем сведения по новым подаркам
    function (cb) {
      if(isSelf) {
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, ["id"], constants.T_USER_NEW_GIFTS, ["userid"], [1]);
  
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
    
          var newIds = [];
    
          for(var i = 0; i < result.rows.length; i++) {
            newIds.push(result.rows[i].id);
          }
    
          cb(null, newIds);
    
        });
      } else { cb(null, []); }
      
    },
    function (newIds, cb) {
      var fields = ["id", "giftid", "type", "src", "date", "title", "fromid", "fromvid"];
      var constFields = ["userid"];
      var constValues = [1];
  
      // Отбираем все подарки пользователя
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERGIFTS, constFields, constValues);
  
      cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
    
        var gifts = [];
  
        var userList = [];
        var constValues = 0;
  
        for(var i = 0; i < result.rows.length; i++) {
    
          var gift = result.rows[i];
          gift.id       = gift.id.toString();
          gift.giftid   = gift.giftid.toString();
          gift.fromid   = gift.fromid.toString();
          gift.fromvid  = gift.fromvid.toString();
          
          if(isSelf) {
            gift.is_new   = false;
  
            for(var nid = 0; nid < newIds.length; nid++) {
              if(gift.id == newIds[nid]) {
                gift.is_new = true;
              }
            }
          }
    
          gifts.push(gift);
          if(userList.indexOf(gift.fromid) < 0) {
            constValues ++;
            userList.push(gift.fromid);
          }
        }
  
        cb(null, gifts, constValues, userList, newIds.length);
        
      });
    },
    function (gifts, constValues, userList, countNews, cb) {// Отбираем сведения по подарившим
      
      var fields = ["id", "vid", "sex", "city", "country", "points"];
      var constFields = ["id"];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, constFields, [constValues]);
  
      cdb.client.execute(query, userList, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
    
        var users = [], i;
    
        for(i = 0; i < result.rows.length; i++) {
          var user = result.rows[i];
          user.id = user.id.toString();
      
          users.push(user);
        }
    
        // Разбиваем подарки по подарившим
        var giftsLen = gifts.length;
        var j, usersLen = users.length;
        for(i = 0; i < giftsLen; i++) {
          for(j = 0; j < usersLen; j++) {
        
            if(users[j].id == gifts[i].fromid) {
              if (!users[j].gifts) { users[j].gifts = []; }
          
              users[j].gifts.push({
                giftid : gifts[i].giftid,
                type   : gifts[i].type,
                title  : gifts[i].title,
                src    : gifts[i].src,
                date   : gifts[i].date,
                is_new : gifts[i].is_new
              });
            }
        
          }
        }
    
        for(i = 0; i < users.length; i++) {
          users[i].gifts.sort(function (gift1, gift2) {
            return (gift1.date < gift2.date)? 1 : -1;
          })
        }
    
        cb(null, { gifts : users, new_gifts : countNews });
      });
    }
  ],
  function (err, res) {
    if(err) { return callback(err, null); }
    
    callback(null, res);
  });
  
};