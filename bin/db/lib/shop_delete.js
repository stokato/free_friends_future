/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
    var id = goodid;
    if (!id) { callback(new Error("Задан пустой Id товара")); }

    var query = "DELETE FROM shop WHERE id = ?";

    this.client.execute(query, [results.rows[0].id], {prepare: true }, function(err) {
        if (err) {  return callback(err); }

        cb(null, goodid);
    });

};