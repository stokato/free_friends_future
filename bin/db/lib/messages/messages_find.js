const async = require('async');

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');
const bdayToAge = require('./../common/bdayToAge');

/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  
  const DBF   = DB_CONST.USER_MESSAGES.fields;
  const DBN   = DB_CONST.USER_MESSAGES.name;
  
  const DBFN  = DB_CONST.USER_NEW_MESSAGES.fields;
  const DBNN  = DB_CONST.USER_NEW_MESSAGES.name;
  
  const DBFCN = DB_CONST.USER_NEW_CHATS.fields;
  const DBNCN = DB_CONST.USER_NEW_CHATS.name;
  
  let companionsArr = options[PF.ID_LIST] || [];
  let firstDate     = options[PF.DATE_FROM];
  let secondDate    = options[PF.DATE_TO];
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  if (!companionsArr[0]) {
    return callback(new Error("Задан пустой Id собеседника"), null);
  }
  
  let paramsArr = [uid];
  
  let companionsCount = companionsArr.length;
  for(let i = 0; i < companionsCount; i++) {
    paramsArr.push(companionsArr[i]);
  }
  
  async.waterfall([//-----------------------------------------------------------
      function (cb) {
        let fieldsArr = [DBFN.COMPANIONID_uuid_pc2i];

        let condFieldsArr = [DBFN.USERID_uuid_pci];
        let condValuesArr = [1];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, condValuesArr);
        
        dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          let newIDArr = [];
          
          let rowsLen = result.rows.length;
          for(let i = 0; i < rowsLen; i++) {
            newIDArr.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2i].toString());
          }
          
          cb(null, newIDArr);
        });
      },//-----------------------------------------------------------
      function(newIDArr, cb) { // Получаем историю сообщений за указанный период (прочитанных)
        
        let condMore, condLess;
        let paramsArr = paramsArr.slice(0);
        
        if (firstDate) {
          condMore = condLess = "id";
          paramsArr.push(dbCtrlr.timeUuid.fromDate(firstDate));
          paramsArr.push(dbCtrlr.timeUuid.fromDate(secondDate));
        }
        
        let fieldsArr = [dbCtrlr.qBuilder.ALL_FIELDS];
        let condFeildsArr = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i];
        let condValuesArr = [1, companionsArr.length];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFeildsArr,
                                                                      condValuesArr, condMore, condLess);
        
        dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          let messagesArr = [];
          
          for(let i = 0; i < result.rows.length; i++) {
            let rowObj = result.rows[i];
            
            let messageObj = {
              [PF.CHATID]     : rowObj[DBF.COMPANIONID_uuid_pc2i].toString(),
              [PF.CHATVID]    : rowObj[DBF.COMPANIONVID_varchar],
              [PF.DATE]       : rowObj[DBF.DATE_timestamp],
              [PF.TEXT]       : rowObj[DBF.TEXT_text],
              [PF.MESSAGEID]  : rowObj[DBF.ID_timeuuid_c].toString()
            };

            
            if(rowObj[DBF.INCOMING_boolean] == true) {
              messageObj[PF.ID]  = rowObj[DBF.COMPANIONID_uuid_pc2i].toString();
              messageObj[PF.VID] = rowObj[DBF.COMPANIONVID_varchar];
              messageObj[PF.SEX] = rowObj[DBF.COMPANIONSEX_int];
              messageObj[PF.AGE] = bdayToAge(rowObj[DBF.COMPANIONBDATE_timestamp]);
            } else {
              messageObj[PF.ID]  = rowObj[DBF.USERID_uuid_pci].toString();
              messageObj[PF.VID] = rowObj[DBF.USERVID_varchar];
              messageObj[PF.SEX] = rowObj[DBF.USERSEX_int];
              messageObj[PF.AGE] = bdayToAge(rowObj[DBF.USERBDATE_timestamp]);
            }
            
            messageObj[PF.ISNEW] = false;
            
            for(let nid = 0; nid < newIDArr.length; nid++) if(messageObj[PF.ID] == newIDArr[nid]) {
                messageObj[PF.ISNEW] = true;
            }
            
            messagesArr.push(messageObj);
          }
          cb(null, messagesArr);
        });
      },//-----------------------------------------------------------
      function(messages, cb) { // Удаляем сообщения из таблицы новых
        let condFieldsArr = [DBFN.USERID_uuid_pci, DBFN.COMPANIONID_uuid_pc2i];
        let condValuesArr = [1, companionsArr.length];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNN, condFieldsArr, condValuesArr);
        
        dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, messages);
        });
      },//-----------------------------------------------------------
      function(messages, cb) {
        
        let paramsArr = [uid];
        let condFieldsArr = [DBFCN.USERID_uuid_pc1i, DBFCN.COMPANIONID_uuid_pc2];
        let condValuesArr = [ 1, companionsArr.length ];
        
        let companionsLen = companionsArr.length;
        for (let i = 0; i < companionsLen; i ++) {
          paramsArr.push(companionsArr[i]);
        }
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNCN, condFieldsArr, condValuesArr);
        
        dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
          if (err) {
            return cb(err);
          }
          
          cb(null, messages);
        });
      }
    ], //-----------------------------------------------------------
    function(err, messages) {
      if(err)  {
        return callback(err, null);
      }
      
      callback(null, messages);
    })
  
};

