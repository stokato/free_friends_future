/*
 Удалить товар из товаров пользователя: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(purchaseid, callback) {
  var id = purchaseid;
  if (!id) { callback(new Error("Задан пустой Id покупки")); }

  var query = "DELETE FROM user_goods WHERE id = ?";

  this.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};