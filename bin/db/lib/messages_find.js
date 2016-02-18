/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) {
 var companions = options.id_list || [];
 var date = options.date;

 if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
 if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

 var fields = "";
 var params = [uid];
 for(var i = 0; i < companions.length; i++) {
   if (fields == "")
     fields = fields + "?";
   else
    fields = fields + ", " + "?";

   params.push(companions[i]);
 }

 var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
 if (date) {
   query = query + " and id > ?";
   params.push(this.timeUuid.fromDate(date));
 }


 this.client.execute(query,params, {prepare: true }, function(err, result) {
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


