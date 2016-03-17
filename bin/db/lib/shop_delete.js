var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { callback(new Error("Задан пустой Id товара")); }

  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_SHOP, [C.IO.FIELDS.id], [1]);

  this.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};