var db = require('./../../../db_manager');

/*
    Получаем историю сообщений одного собеседника
 */
module.exports = function(options, callback) {
 var self = this;

 if(self._pIsPrivateChats[0]) { // Если есть открытые чаты
   var arr = [];
   for(var i = 0; i < self._pIsPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self._pIsPrivateChats[i].id);
   }

   var params = {};
   params[db.CONST.ID_LIST]     = arr;
   params[db.CONST.DATE_FROM]   = options.first_date;
   params[db.CONST.DATE_TO]     = options.second_date;
  
   // Получаем историю
   db.findMessages(self._pID, params, function(err, messages) { messages = messages || [];
     if (err) { return callback(err, null); }
  
     messages.sort(function (mesA, mesB) {
       return mesA.date - mesB.date;
     });

     callback(null, messages);
   });
 } else { callback(null, null) ;}
};
