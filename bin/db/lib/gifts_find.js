/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, callback) {
    if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null);}

    var query = "select giftid, type, data, date, fromid, fromvid FROM user_gifts where userid = ?";

    this.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var gifts = [];

        if(result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
                var row= result.rows[i];
                var gift = {
                    giftidid : row.giftid,
                    type : row.type,
                    data : row.data,
                    date : row.date,
                    fromid : row.fromid,
                    fromvid : row.fromvid
                };
                gifts.push(gift);
            }

            callback(null, gifts);

        } else {
            callback(null, null);
        }
    });
};