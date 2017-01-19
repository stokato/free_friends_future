/**
 * Получаем историю по всем открытым чатам пользователя
 *
 * @param fdate, sdate - временной период, callback
 * @return messages - осписок сообщений пользователя
 */

const db  = require('./../../db_manager');
const IOF = require('./../../const_fields');

module.exports = function(fdate, sdate, callback) {
 let self = this;

 if(self._pIsPrivateChats[0]) { // Если есть открытые чаты
   let arr = [];
   for(let i = 0; i < self._pIsPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self._pIsPrivateChats[i]);
   }

   let params = {
     [IOF.ID_LIST]     : arr,
     [IOF.DATE_FROM]   : fdate,
     [IOF.DATE_TO]     : sdate
   };

  
   // Получаем историю
   db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
     if (err) { return callback(err, null); }
  
     messages.sort(function (mesA, mesB) {
       return mesA[IOF.DATE] - mesB[IOF.DATE];
     });

     callback(null, messages);
   });
 } else { callback(null, null) ;}
};
