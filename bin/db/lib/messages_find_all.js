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
   params.push(result.rows[0].companionid);
   for(var i = 1; i< result.rows.length; i++) {
     params.push(result.rows[i].companionid);
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

     if(result.rows.length > 0) {
       for(var i = 0; i < result.rows.length; i++) {
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
       callback(null, messages);
     } else {
       callback(null, null);
     }
   });
 });
};