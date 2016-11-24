var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Получаем историю сообщений одного собеседника
 */
module.exports = function(fdate, sdate, callback) {
 var self = this;

 if(self._pIsPrivateChats[0]) { // Если есть открытые чаты
   var arr = [];
   for(var i = 0; i < self._pIsPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self._pIsPrivateChats[i]);
   }

   var params = {};
   params[IOF.ID_LIST]     = arr;
   params[IOF.DATE_FROM]   = fdate;
   params[IOF.DATE_TO]     = sdate;
  
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
