var constants = require('../../../constants');
var db = require('./../../../db_manager');

/*
 Получаем историю сообщений одного собеседника:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(options, callback) {
 var self = this;

 if(self.pPrivateChats[0]) { // Если есть открытые чаты
   var arr = [];
   for(var i = 0; i < self.pPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self.pPrivateChats[i]["id"]);
   }

   var params = {};
   params.id_list        = arr;
   params.first_date  = options.first_date;
   params.second_date = options.second_date;
  
   // Получаем историю
   db.findMessages(self.pID, params, function(err, messages) { messages = messages || [];
     if (err) { return callback(err, null); }
  
     messages.sort(function (mesA, mesB) {
       return mesA.date - mesB.date;
     });

     callback(null, messages);

   });
 } else { callback(null, null) ;}
};
