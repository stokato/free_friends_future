var constants = require('../../io/constants');
/*
 Получаем историю сообщений одного собеседника:
 - Читаем из БД
 - Если задан параметр count - указанное количество с конца
 - Если задан position - count с указанной позиции
 */
module.exports = function(options, callback) {
 var self = this;
 //var f = constants.FIELDS;

 if(self.pPrivateChats[0]) { // Если есть открытые чаты
   var arr = [];
   for(var i = 0; i < self.pPrivateChats.length; i++) { // Готовим массив их ид
     arr.push(self.pPrivateChats[i]["id"]);
   }

   var params = {};
   params.id_list        = arr;
   params.first_date  = options.first_date;
   params.second_date = options.second_date;

   self.dbManager.findMessages(self.pID, params, function(err, messages) { // Получаем историю
     if (err) { return callback(err, null); }

     messages = messages || [];
     var message = {};
     var i, j, history = [];
     for(i = 0; i < messages.length; i++) {
       for(j = 0; j < self.pPrivateChats.length; j++) {

         var currChat = self.pPrivateChats[j];
         if(messages[i]["incoming"] && messages[i]["companionid"] == currChat.id) {
           message.vid     = currChat.vid;
           message.city    = currChat.city;
           message.country = currChat.country;
           message.sex     = currChat.sex;
         }
         if(!messages[i].incoming && messages[i].userid.toString() == self.getID()) {
           message.vid     = self.pVID;
           message.city    = self.pCity;
           message.country = self.pCountry;
           message.sex     = self.pSex;
         }
         message.chat = currChat["id"];
         message.chatVID = currChat["vid"];
         message.date = messages[i]["date"];
         message.text = messages[i]["text"];

         history.push(message);
       }
     }

     callback(null, history);

   });
 } else { callback(null, null) ;}
};
