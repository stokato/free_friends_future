/*
 Найти сохраненные сообщения пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) {
 var self = this;
 if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
 var date = options.date;
 var params = [uid];

 var query = "select companionid FROM user_chats where userid = ?";

 self.client.execute(query, params, {prepare: true }, function(err, result) {
   if (err) { return callback(err, null); }

   if(result.rows.length == 0) return callback(null, null);

   var fields = "?";
   var companions = result.rows;
   params.push(companions[0].companionid);
   var i;
   var compLen = companions.length;
   for(i = 1; i< compLen; i++) {
     params.push(companions[i].companionid);
     fields = fields + ", ?";
   }

   query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
   if (date) {
     query = query + " and id > ?";
     params.push(self.timeUuid.fromDate(date));
   }

   self.client.execute(query, params, {prepare: true }, function(err, result) {
     if (err) { return callback(err, null); }
     var messages = [];

     var i;
     var rowsLen = result.rows.length;
     if(rowsLen > 0) {
       for(i = 0; i < rowsLen; i++) {
         var row = result.rows[i];
         var message = {
           id        : row.id,
           date      : row.date,
           companionid : row.companionid,
           companionvid : row.companionvid,
           incoming  : row.incoming,
           text      : row.text,
           opened    : row.opened
         };
         messages.push(message);
       }

       var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
       params = [];


       var compLen = companions.length;
       for(i = 0; i< compLen; i++) {
         params.push(companions[i].companionid);
       }
       self.client.execute(query, params, {prepare: true }, function(err, result) {
         if (err) { return callback(err, null); }

         var users = [];
         var rowsLen = result.rows.length;
         for(i = 0; i < rowsLen; i++) {
           var row = result.rows[i];
           var user = {
             id      : row.id,
             vid     : row.vid,
             age     : row.age,
             sex     : row.sex,
             city    : row.city,
             country : row.country,
             points  : row.points || 0
           };
           users.push(user);
         }

         var i, j;
         var mesLen = messages.length;
         var userLen = users.length;
         for(i = 0; i < mesLen; i++) {
           for(j = 0; j < userLen; j++) {
             if(users[j].id.toString() == messages[i].companionid.toString()) {
               if (!users[j].messages) users[j].messages = [];
               if (messages[i].opened == false) users[j].opened = true;
               var message = {
                 id:   messages[i].id,
                 companionid : messages[i].companionid,
                 opened: messages[i].opened,
                 text: messages[i].text,
                 date: messages[i].date
               };
               users[j].messages.push(message);
             }
           }
         }
         callback(null, users);
       });
     } else {
       callback(null, null);
     }
   });
 });
};