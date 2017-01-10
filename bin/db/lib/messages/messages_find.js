const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');
const constants = require('./../../../constants');

const DBF     = dbConst.USER_MESSAGES.fields;
const DBFN    = dbConst.USER_NEW_MESSAGES.fields;
const DBFCN   = dbConst.USER_NEW_CHATS.fields;
const PF      = constants.PFIELDS;

/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  let companions = options[PF.ID_LIST] || [];
  let firstDate =  options[PF.DATE_FROM];
  let secondDate = options[PF.DATE_TO];
  
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
  if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }
  
  let fields = "";
  let params = [uid];
  
  for(let i = 0; i < companions.length; i++) {
    if (fields == "") { fields = fields + "?"; }
    else { fields = fields + ", " + "?"; }
    
    params.push(companions[i]);
  }
  async.waterfall([//-----------------------------------------------------------
      function (cb) {
        let fields = [DBFN.COMPANIONID_uuid_pc2i];
        let dbName = dbConst.USER_NEW_MESSAGES.name;
        let constFields = [DBFN.USERID_uuid_pci];
        let constValues = [1];
        
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
        
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          
          let newIds = [];
          
          for(let i = 0; i < result.rows.length; i++) {
            newIds.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2i].toString());
          }
          
          cb(null, newIds);
        });
      },//-----------------------------------------------------------
      function(newIDs, cb) { // Получаем историю сообщений за указанный период (прочитанных)
        //let query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
        let const_more, const_less;
        let params2 = params.slice(0);
        if (firstDate) {
          const_more = const_less = "id";
          params2.push(cdb.timeUuid.fromDate(firstDate));
          params2.push(cdb.timeUuid.fromDate(secondDate));
        }
        
        let constFields = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i];
        let constValues = [1, companions.length];
        let dbName = dbConst.USER_MESSAGES.name;
        
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, [cdb.qBuilder.ALL_FIELDS],
          dbName, constFields, constValues, const_more, const_less);
        
        cdb.client.execute(query, params2, {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          let messages = [], message, row;
          
          for(let i = 0; i < result.rows.length; i++) {
            row = result.rows[i];
            
            message = {};
            message[PF.CHATID]   = row[DBF.COMPANIONID_uuid_pc2i].toString();
            message[PF.CHATVID] = row[DBF.COMPANIONVID_varchar];
            message[PF.DATE]    = row[DBF.DATE_timestamp];
            message[PF.TEXT]    = row[DBF.TEXT_text];
            message[PF.MESSAGEID] = row[DBF.ID_timeuuid_c].toString();
            
            if(row[DBF.INCOMING_boolean] == true) {
              message[PF.ID] = row[DBF.COMPANIONID_uuid_pc2i].toString();
              message[PF.VID] = row[DBF.COMPANIONVID_varchar];
              message[PF.SEX] = row[DBF.COMPANIONSEX_int];
              message[PF.AGE] = bdayToAge(row[DBF.COMPANIONBDATE_timestamp]);
            } else {
              message[PF.ID] = row[DBF.USERID_uuid_pci].toString();
              message[PF.VID] = row[DBF.USERVID_varchar];
              message[PF.SEX] = row[DBF.USERSEX_int];
              message[PF.AGE] = bdayToAge(row[DBF.USERBDATE_timestamp]);
            }
            
            message[PF.ISNEW] = false;
            
            for(let nid = 0; nid < newIDs.length; nid++) {
              if(message[PF.ID] == newIDs[nid]) {
                message[PF.ISNEW] = true;
              }
            }
            
            messages.push(message);
          }
          cb(null, messages);
        });
      },//-----------------------------------------------------------
      function(messages, cb) { // Удаляем сообщения из таблицы новых
        let constFields = [DBFN.USERID_uuid_pci, DBFN.COMPANIONID_uuid_pc2i];
        let constValues = [1, companions.length];
        let dbName = dbConst.USER_NEW_MESSAGES.name;
        
        //let query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
        
        cdb.client.execute(query, params, {prepare: true }, function(err) {
          if (err) {  return cb(err, null); }
          
          cb(null, messages);
        });
      },//-----------------------------------------------------------
      function(messages, cb) {
        
        let params = [uid];
        let constFields = [DBFCN.USERID_uuid_pc1i, DBFCN.COMPANIONID_uuid_pc2];
        let constValues = [ 1, companions.length ];
        let dbName = dbConst.USER_NEW_CHATS.name;
        
        for (let i = 0; i < companions.length; i ++) {
          params.push(companions[i]);
        }
        
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
        cdb.client.execute(query, params, { prepare: true }, function(err) {
          if (err) { return cb(err); }
          
          cb(null, messages);
        });
      }
    ], //-----------------------------------------------------------
    function(err, messages) {
      if(err) return callback(err, null);
      
      callback(null, messages);
    })
  
};

