var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GUESTS.fields;
var DBFN = dbConst.DB.USER_NEW_GUESTS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, isSelf, callback) {
  
  if (!uid ) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([ //---------------------------------------------------
      function (cb) {
        if(isSelf) {
          var fields = [DBFN.GUESTID_uuid_pc2i];
          var dbName = dbConst.DB.USER_NEW_GUESTS.name;
          var constFields = [DBFN.USERID_uuid_pc1i];
          var constValues = [1];
          
          var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
          
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
            
            var newIds = [];
            
            for(var i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i][DBFN.GUESTID_uuid_pc2i].toString());
            }
            
            cb(null, newIds);
          });
        } else { cb(null, []); }
        
      }, //---------------------------------------------------------------
      function (newIds, cb) {
        
        // Отбираем всех гостей
        var fields = [
          DBF.GUESTID_uuid_ci,
          DBF.GUESTVID_varchar,
          DBF.DATE_timestamp,
          DBF.GUESTBDATE_timestamp,
          DBF.GUESTSEX_int
        ];
        
        var constFields = [DBF.USERID_uuid_p];
        var constValues = [1];
        var dbName = dbConst.DB.USER_GUESTS.name;
        
        //var query = "select guestid, guestvid, date FROM user_guests where userid = ?";
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
        
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          
          var guests = [];
          
            var row;
            for(var i = 0; i < result.rows.length; i++) {
              row = result.rows[i];
              
              var guest = {};
              guest[PF.ID]    = row[DBF.GUESTID_uuid_ci].toString();
              guest[PF.VID]   = row[DBF.GUESTVID_varchar];
              guest[PF.DATE]  = row[DBF.DATE_timestamp];
              guest[PF.AGE]   = bdayToAge(row[DBF.GUESTBDATE_timestamp]);
              guest[PF.SEX]   = row[DBF.GUESTSEX_int];
              
              if(isSelf) {
                guest[PF.ISNEW] = false;
                
                for(var nid = 0; nid < newIds.length; nid++) {
                  if(guest[PF.ID] == newIds[nid]) {
                    guest[PF.ISNEW] = true;
                  }
                }
              }
              
              guests.push(guest);
            }
  
            cb(null, { guests : guests, new_guests : newIds.length });
        });
      }
    ], // -------------------------------------------------------------
    function (err, guests) {
      if (err) { return callback(err, null); }
      
      callback(null, guests);
    });
  
};