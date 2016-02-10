/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
    var query = "select id, title, type, price, data FROM shop";

    this.client.execute(query,[], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var goods = [];
        for (var i = 0; i < result.rows.length; i++) {
            var gd = result.rows[i];


            goods.push({
                giftid: gd.id,
                title: gd.title,
                type : gd.type,
                price: gd.price,
                data:  gd.data
            });
        }
        callback(null, goods);
    });
};