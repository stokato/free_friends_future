/*
 Найти сохраненные сообщения пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, callback) {
 if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }

 var query = "select * FROM user_messages where userid = ?";

 this.client.execute(query,[uid], {prepare: true }, function(err, result) {
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
};