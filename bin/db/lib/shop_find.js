/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodid, callback) {

    if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

    var query = "select title, type, price, data FROM shop where id = ?";

    this.client.execute(query,[goodid], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        if(result.rows.length == 0) { return callback(null, null); }
        var gd = result.rows[0];

        var good = {
            id   : goodid,
            title: gd.title,
            type : gd.type,
            price: gd.price,
            data:  gd.data
        };

        callback(null, good);
    });
};