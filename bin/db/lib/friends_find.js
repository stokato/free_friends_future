/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, callback) {
    if (!uid) {
        return callback(new Error("Задан пустой Id"), null);
    }

    var query = "select friendid, friendvid, date FROM user_friends where userid = ?";

    this.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var friends = [];
        var friend = null;

        if(result.rows.length > 0) {

            for(var i = 0; i < result.rows.length; i++) {
                friend = { id: result.rows[i].friendid, vid: result.rows[i].friendvid, date: result.rows[i].date };
                friends.push(friend);
            }

            callback(null, friends);

        } else { return callback(null, null); }
    });
};