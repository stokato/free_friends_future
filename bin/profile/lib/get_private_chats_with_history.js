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
     arr.push(self.pPrivateChats[i].id);
   }
   var options = {
     id_list : arr,
     fdate    : options.fdate,
     sdate    : options.sdate
   };
   self.dbManager.findMessages(self.pID, options, function(err, messages) { // Получаем историю
     if (err) { return callback(err, null); }

     messages = messages || [];
     var message = null;
     var history = [];
     for(var i = 0; i < messages.length; i++) {
       for(var j = 0; j < self.pPrivateChats.length; j++) {
         var currChat = self.pPrivateChats[j];
         if(messages[i].incoming && messages[i].companionid.toString() == currChat.id.toString) {
           message = {
             chat    : currChat.id,
             id      : currChat.id,
             vid     : currChat.vid,
             date    : messages[i].date,
             text    : messages[i].text,
             city    : currChat.city,
             country : currChat.country,
             sex     : currChat.sex
           };
           history.push(message);
         }
         if(!messages[i].incoming && messages[i].userid.toString() == self.getID()) {
           message = {
             chat    : currChat.id,
             id      : self.getID(),
             vid     : self.getVID(),
             date    : messages[i].date,
             text    : messages[i].text,
             city    : self.getCity(),
             country : self.getCountry(),
             sex     : self.getSex()
           };
           history.push(message);
         }
       }
     }
     //messages.sort(compareCompanions); // Сортируем по ид

     //var chats = {};
     //for(var j = 0; j < self.pPrivateChats.length; j++) { // Готовим список чатов
     //  var chat = self.pPrivateChats[j].id;
     //  chats[chat] = {
     //    id       : chat.id,
     //    vid      : chat.vid,
     //    age      : chat.age,
     //    city     : chat.city,
     //    country  : chat.country,
     //    sex      : chat.sex,
     //    messages : []
     //  }
     //}

     //var currChat = null;
     //for(var i = 0; i < messages.length; i++) { // Разносим историю по чатам
     //  if(currChat != messages[i].companionid.toString()) {
     //    currChat = messages[i].companionid.toString();
     //  }
     //
     //  chats[currChat].messages.push(messages[i]);
     //}


     callback(null, history);

   });
 } else { callback(null, null) ;}
};

//// Для сортировки массива игроков (получение топа по очкам)
//function compareCompanions(userA, userB) {
// return userB.companionid - userA.companionid;
//}