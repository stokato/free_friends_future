/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, callback) {
    if (!uid ) {
        return callback(new Error("Задан пустой Id"), null);
    }

    var query = "select guestid, guestvid, date FROM user_guests where userid = ?";

    this.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var guests = [];
        var guest = null;

        if(result.rows.length > 0) {
            var row;
            for(var i = 0; i < result.rows.length; i++) {
                row = result.rows[i];
                guest = { id: row.guestid, vid: row.guestvid, date: row.date };
                guests.push(guest);
            }

            callback(null, guests);

        } else { return callback(null, null); }
    });
};