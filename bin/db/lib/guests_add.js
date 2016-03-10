/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, gst, callback) {
 var guest = gst || {};
 var gid   = guest.id;
 var gvid = guest.vid;
 var date = guest.date;

 if ( !uid || !gid || !date || !gvid) {
   return callback(new Error("Не указан Id пользователя или его друга"), null);
 }

 var fields = "userid, guestid, guestvid, date";
 var values = "?, ?, ?, ?";

 var params = [uid, gid, gvid, date];

 var query = "INSERT INTO user_guests (" + fields + ") VALUES (" + values + ")";

 this.client.execute(query, params, {prepare: true },  function(err) {
   if (err) {  return callback(err); }

   callback(null, guest);
 });

};