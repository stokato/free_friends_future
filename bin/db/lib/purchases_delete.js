var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Удалить товар из товаров пользователя: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(id, callback) {
  if (!id) { callback(new Error("Задан пустой Id покупки")); }

  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERGOODS, ["id"], [1]);

  this.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};