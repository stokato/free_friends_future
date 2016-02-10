/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(usr, callback) {
    var user = usr || {};
    var id = user.id;
    var vid = user.vid;

    if (!id || !vid) {
        return callback(new Error("Задан пустй Id пользователя"), null);
    }

    var fields = " vid = ? ";
    var params = [];
    params.push(user.vid);
    if (user.age)       { fields = fields + ", age = ? ";      params.push(user.age); }
    if (user.location)  { fields = fields + ", location = ? "; params.push(user.location); }
    if (user.status)    { fields = fields + ", status = ? ";   params.push(user.status); }
    if (user.money)     { fields = fields + ", money = ? ";    params.push(user.money); }
    if (user.gender)    { fields = fields + ", gender = ? ";   params.push(user.gender); }
    if (user.points)    { fields = fields + ", points = ? ";   params.push(user.points); }

    var query = "update users set " + fields + " where id = ?";
    params.push(id);

    this.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        callback(null, user);
    });
};