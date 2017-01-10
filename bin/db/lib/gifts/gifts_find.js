const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');
const constants = require('./../../../constants');

const DBF   = dbConst.USER_GIFTS.fields;
const DBFN  = dbConst.USER_NEW_GIFTS.fields;
const PF    = constants.PFIELDS;


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
        let fields = [DBFN.ID_uuid_p];
        let dbName = dbConst.USER_NEW_GIFTS.name;
        let constFields = [DBFN.USERID_uuid_i];
        let constValues = [1];
        
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
    
          let newIds = [];
    
          for(let i = 0; i < result.rows.length; i++) {
            newIds.push(result.rows[i][DBFN.ID_uuid_p]);
          }
    
          cb(null, newIds);
    
        });
      } else { cb(null, []); }
      
    }, //-------------------------------------------------------------------------------
    function (newIds, cb) {
      let fields = [
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
      let constFields = [DBF.USERID_uuid_i];
      let constValues = [1];
      let dbName = dbConst.USER_GIFTS.name;
  
      // Отбираем все подарки пользователя
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
      cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
  
        let users = {}, arrUsers = [], user, gift, row;
        
        for(let i = 0; i < result.rows.length; i++) {
          row = result.rows[i];
          
          gift = {
            [PF.ID]     : row[DBF.ID_uuid_p].toString(),
            [PF.GIFTID] : row[DBF.GIFTID_varchar],
            [PF.FID]    : row[DBF.FROMID_uuid].toString(),
            [PF.FVID]   : row[DBF.FROMVID_varchar],
            [PF.TYPE]   : row[DBF.TYPE_varchar],
            [PF.SRC]    : row[DBF.SRC_varhar],
            [PF.DATE]   : row[DBF.DATE_timestamp],
            [PF.TITLE]  : row[DBF.TITLE_varchar]
          };
  
          if(isSelf) {
            gift[PF.ISNEW]   = false;
    
            for(let nid = 0; nid < newIds.length; nid++) {
              if(gift[PF.ID] == newIds[nid]) {
                gift[PF.ISNEW] = true;
              }
            }
          }
          
          if(!users[gift[PF.FID]]) {
            user = {
              [PF.ID]     : gift[PF.FID],
              [PF.VID]    : gift[PF.FVID],
              [PF.AGE]    : bdayToAge(row[DBF.FROMBDATE_timestamp]),
              [PF.SEX]    : row[DBF.FROMSEX_int],
              [PF.GIFTS]  : []
            };
            
            users[user[PF.ID]] = user;
          }
  
          users[user[PF.ID]][PF.GIFTS].push(gift);
    
        }
        
        for(let index in users) if(users.hasOwnProperty(index)) {
          arrUsers.push(users[index]);
        }
  
        cb(null, { gifts : arrUsers, new_gifts : newIds.length });
        
      });
    }], //-----------------------------------------------------------------------
  function (err, res) {
    if(err) { return callback(err, null); }
    
    callback(null, res);
  });
  
};