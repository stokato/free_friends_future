/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, frnd, callback) {
    var friend = frnd || {};
    var fid   = friend.id;
    var date = friend.date;
    var fvid = friend.vid;

    if ( !uid || !fid || !fvid) {
        return callback(new Error("Не указан Id пользователя или его друга"), null);
    }

    var fields = "userid, friendid, friendvid, date";
    var values = "?, ?, ?, ?";

    var params = [uid, fid, fvid, date];

    var query = "INSERT INTO user_friends (" + fields + ") VALUES (" + values + ")";

    this.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err); }

        callback(null, frnd);
    });
};