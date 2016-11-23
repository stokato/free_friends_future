var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_MESSAGES.fields;
var DBFN = dbConst.DB.USER_NEW_MESSAGES.fields;
var DBFCN = dbConst.DB.USER_NEW_CHATS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var companions = options[PF.ID_LIST] || [];
  var firstDate =  options[PF.DATE_FROM];
  var secondDate = options[PF.DATE_TO];

  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
  if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

  var fields = "";
  var params = [uid];

  for(var i = 0; i < companions.length; i++) {
    if (fields == "") { fields = fields + "?"; }
    else { fields = fields + ", " + "?"; }

    params.push(companions[i]);
  }
  async.waterfall([//-----------------------------------------------------------
    function (cb) {
      var fields = [DBFN.ID_timeuuid_c];
      var dbName = dbConst.DB.USER_NEW_MESSAGES.name;
      var constFields = [DBFN.USERID_uuid_pci];
      var constValues = [1];
    
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
    
      cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
      
        var newIds = [];
      
        for(var i = 0; i < result.rows.length; i++) {
          newIds.push(result.rows[i][DBFN.ID_timeuuid_c].toString());
        }
      
        cb(null, newIds);
      });
    },//-----------------------------------------------------------
    function(newIDs, cb) { // Получаем историю сообщений за указанный период (прочитанных)
      //var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
      var const_more, const_less;
      var params2 = params.slice(0);
      if (firstDate) {
        const_more = const_less = "id";
        params2.push(cdb.timeUuid.fromDate(firstDate));
        params2.push(cdb.timeUuid.fromDate(secondDate));
      }

      var constFields = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i];
      var constValues = [1, companions.length];
      var dbName = dbConst.DB.USER_MESSAGES.name;

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, [cdb.qBuilder.ALL_FIELDS],
                                      dbName, constFields, constValues, const_more, const_less);

      cdb.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var messages = [], message, row;
        
          for(var i = 0; i < result.rows.length; i++) {
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
              message[PF.AGE] = bdayToAge(row[DBF.COMPANIONBDAY_timestamp]);
            } else {
              message[PF.ID] = row[DBF.USERID_uuid_pci].toString();
              message[PF.VID] = row[DBF.USERVID_varchar];
              message[PF.SEX] = row[DBF.USERSEX_int];
              message[PF.AGE] = bdayToAge(row[DBF.USERBDAY_timestamp]);
            }
            
            message[PF.ISNEW] = false;
            
            for(var nid = 0; nid < newIDs.length; nid++) {
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
      var constFields = [DBFN.USERID_uuid_pci, DBFN.COMPANIONID_uuid_pc2i];
      var constValues = [1, companions.length];
      var dbName = dbConst.DB.USER_NEW_MESSAGES.name;

      //var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

      cdb.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err, null); }

        cb(null, messages);
      });
    },//-----------------------------------------------------------
    function(messages, cb) {
  
      var params = [uid];
      var constFields = [DBFCN.USERID_uuid_p, DBFCN.COMPANIONID_uuid_c];
      var constValues = [ 1, companions.length ];
      var dbName = dbConst.DB.USER_NEW_CHATS.name;
      
      for (var i = 0; i < companions.length; i ++) {
        params.push(companions[i]);
      }
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
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

