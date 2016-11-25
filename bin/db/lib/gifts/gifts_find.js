var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GIFTS.fields;
var DBFN = dbConst.DB.USER_NEW_GIFTS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

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
        var fields = [DBFN.ID_uuid_p];
        var dbName = dbConst.DB.USER_NEW_GIFTS.name;
        var constFields = [DBFN.USERID_uuid_i];
        var constValues = [1];
        
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
    
          var newIds = [];
    
          for(var i = 0; i < result.rows.length; i++) {
            newIds.push(result.rows[i][DBFN.ID_uuid_p]);
          }
    
          cb(null, newIds);
    
        });
      } else { cb(null, []); }
      
    }, //-------------------------------------------------------------------------------
    function (newIds, cb) {
      var fields = [
        DBF.ID_uuid_p,
        DBF.GIFTID_varchar,
        DBF.TYPE_varchar,
        DBF.SRC_varhar,
        DBF.DATE_timestamp,
        DBF.TITLE_varchar,
        DBF.FROMID_uuid,
        DBF.FROMVID_varchar,
        DBF.FROMSEX_int,
        DBF.FROMBDATE_timestamp
      ];
      var constFields = [DBF.USERID_uuid_i];
      var constValues = [1];
      var dbName = dbConst.DB.USER_GIFTS.name;
  
      // Отбираем все подарки пользователя
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
      cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
  
        var users = {}, arrUsers = [], user, gift, row;
        
        for(var i = 0; i < result.rows.length; i++) {
          row = result.rows[i];
          
          gift = {};
          gift[PF.ID]         = row[DBF.ID_uuid_p].toString();
          gift[PF.GIFTID]     = row[DBF.GIFTID_varchar];
          gift[PF.FID]   = row[DBF.FROMID_uuid].toString();
          gift[PF.FVID]  = row[DBF.FROMVID_varchar];
          gift[PF.TYPE]       = row[DBF.TYPE_varchar];
          gift[PF.SRC]        = row[DBF.SRC_varhar];
          gift[PF.DATE]       = row[DBF.DATE_timestamp];
          gift[PF.TITLE]      = row[DBF.TITLE_varchar];
  
          if(isSelf) {
            gift[PF.ISNEW]   = false;
    
            for(var nid = 0; nid < newIds.length; nid++) {
              if(gift[PF.ID] == newIds[nid]) {
                gift[PF.ISNEW] = true;
              }
            }
          }
          
          if(!users[gift[PF.FID]]) {
            user = {};
            user[PF.ID]     = gift[PF.FID];
            user[PF.VID]    = gift[PF.FVID];
            user[PF.AGE]    = bdayToAge(row[DBF.FROMBDATE_timestamp]);
            user[PF.SEX]    = row[DBF.FROMSEX_int];
            user[PF.GIFTS]  = [];
            
            users[user[PF.ID]] = user;
          }
  
          users[user[PF.ID]].push(gift);
    
        }
        
        for(var index in users) if(users.hasOwnProperty(index)) {
          arrUsers.push(users[index]);
        }
  
        cb(null, { gifts : arrUsers, new_gifts : newIds.length });
        
      });
    }
  ], //-----------------------------------------------------------------------
  function (err, res) {
    if(err) { return callback(err, null); }
    
    callback(null, res);
  });
  
};