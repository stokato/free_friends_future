/**
 * Получаем историю по всем открытым чатам пользователя
 *
 * @param fdate, sdate - временной период, callback
 * @return messages - осписок сообщений пользователя
 */

const dbCtrlr  = require('./../../db_manager');
const PF       = require('./../../const_fields');

module.exports = function(fdate, sdate, callback) {
 let self = this;

 if(self._pPrivateChats[0]) { // Если есть открытые чаты
   let arr = [];
   let privateChatsLen = self._pPrivateChats.length;
   
   for(let i = 0; i < privateChatsLen; i++) { // Готовим массив их ид
     arr.push(self._pPrivateChats[i]);
   }

   let params = {
     [PF.ID_LIST]     : arr,
     [PF.DATE_FROM]   : fdate,
     [PF.DATE_TO]     : sdate
   };
   
   // Получаем историю
   dbCtrlr.findMessages(self._pID, params, (err, messages) => { messages = messages || [];
     if (err) {
       return callback(err, null);
     }
  
     messages.sort((mesA, mesB) => {
       return mesA[PF.DATE] - mesB[PF.DATE];
     });

     callback(null, messages);
   });
 } else { callback(null, null) ;}
};
