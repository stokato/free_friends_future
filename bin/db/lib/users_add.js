/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) {
 var user = options || {};
 var vid = user.vid;

 if (!vid) { return callback(new Error("Не заданы имя пользователя или его Id"), null); }

 var id = this.uuid.random();

 var fields = "id, vid";
 var values = "?, ?";
 var params = [id, vid];
 if (user.age)       { fields = fields + ", age";      values = values +  ", ?"; params.push(user.age); }
 if (user.country)   { fields = fields + ", country";  values = values +  ", ?"; params.push(user.country); }
 if (user.city)      { fields = fields + ", city";     values = values +  ", ?"; params.push(user.city); }
 if (user.status)    { fields = fields + ", status";   values = values +  ", ?"; params.push(user.status); }
 if (user.money)     { fields = fields + ", money";    values = values +  ", ?"; params.push(user.money); }
 if (user.sex)       { fields = fields + ", sex";      values = values +  ", ?"; params.push(user.sex); }
 if (user.points)    { fields = fields + ", points";   values = values +  ", ?"; params.push(user.points); }

 var query = "INSERT INTO users (" + fields + ") VALUES (" + values + ")";

 this.client.execute(query, params, {prepare: true },  function(err) {
   if (err) {  return callback(err); }

   user.id = id;
   callback(null, user);
 });
};
