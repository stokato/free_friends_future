/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(usr, callback) {
    var user = usr || {};
    var vid = user.vid;

    if (!vid) {
        return callback(new Error("Не заданы имя пользователя или его Id"), null);
    }

    var id = this.uuid.random();

    var fields = "id, vid";
    var values = "?, ?";
    var params = [id, vid];
    if (user.age)       { fields = fields + ", age";      values = values +  ", ?"; params.push(user.age); }
    if (user.location)  { fields = fields + ", location"; values = values +  ", ?"; params.push(user.location); }
    if (user.status)    { fields = fields + ", status";   values = values +  ", ?"; params.push(user.status); }
    if (user.money)     { fields = fields + ", money";  values = values +  ", ?"; params.push(user.money); }
    if (user.gender)    { fields = fields + ", gender";   values = values +  ", ?"; params.push(user.gender); }
    if (user.points)    { fields = fields + ", points";   values = values +  ", ?"; params.push(user.points); }

    var query = "INSERT INTO users (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }
        user.id = id;
        callback(null, user);
    });
};
