/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) {
 var self = this;
 var message = options || {};
 var userid       = uid;
 var companionid  = message.companionid;
 var id           = message.id;
 var date         = message.date;
 var companionvid = message.companionvid;
 var incoming     = message.incoming;
 var text         = message.text;
 var opened       = message.opened;

 if (!id || !userid || !companionid) {
   return callback(new Error("Задан пустй Id пользователя, его собеседника или сообщения"), null);
 }

 var query = "select id FROM user_messages where userid = ? and companionid = ? and id = ?";

 self.client.execute(query,[userid, companionid, id], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null); }

   if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

   var fields = "";
   var params = [];
   if (date)           { fields = fields + ", date = ? ";            params.push(date); }
   if (companionvid)   { fields = fields + ", companionvid = ? ";    params.push(companionvid); }
   if (incoming)       { fields = fields + ", incoming = ? ";        params.push(incoming); }
   if (text)           { fields = fields + ", text = ? ";            params.push(text); }
   if (opened)         { fields = fields + ", opened = ? ";          params.push(opened); }

   fields = fields.substr(1, fields.length );

   var query = "update user_messages set " + fields +
                           " where userid = ? and companionid = ? and id = ?";

   params.push(userid);
   params.push(companionid);
   params.push(id);

   self.client.execute(query, params, {prepare: true }, function(err) {
     if (err) {  return callback(err); }

     callback(null, message);
   });
 });
};