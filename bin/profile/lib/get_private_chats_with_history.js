var constants = require('../../io/constants');
/*
 Получаем историю сообщений одного собеседника:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(options, callback) {
 var self = this;
 var f = constants.FIELDS;

 if(self.pPrivateChats[0]) { // Если есть открытые чаты
   var arr = [];
   for(var i = 0; i < self.pPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self.pPrivateChats[i][f.id]);
   }

   var params = {};
   params.id_list        = arr;
   params[f.first_date]  = options[f.first_date];
   params[f.second_date] = options[f.second_date];

   self.dbManager.findMessages(self.pID, params, function(err, messages) { // Получаем историю
     if (err) { return callback(err, null); }

     messages = messages || [];
     var message = {};
     var i, j, history = [];
     for(i = 0; i < messages.length; i++) {
       for(j = 0; j < self.pPrivateChats.length; j++) {

         var currChat = self.pPrivateChats[j];
         if(messages[i][f.incoming] && messages[i][f.companionid] == currChat[f.id]) {
           message[f.vid]     = currChat[f.vid];
           message[f.city]    = currChat[f.city];
           message[f.country] = currChat[f.country];
           message[f.sex]     = currChat[f.sex];
         }
         if(!messages[i].incoming && messages[i].userid.toString() == self.getID()) {
           message[f.vid]     = self.pVID;
           message[f.city]    = self.pCity;
           message[f.country] = self.pCountry;
           message[f.sex]     = self.pSex;
         }
         message[f.chat] = currChat[f.id];
         message[f.date] = messages[i][f.date];
         message[f.text] = messages[i][f.text];

         history.push(message);
       }
     }

     callback(null, history);

   });
 } else { callback(null, null) ;}
};
