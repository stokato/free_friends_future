var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { return callback(new Error("Задан пустой Id товара")); }

  var constFields = ["id"];
  var constValues = [1];

  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_SHOP, constFields, constValues);

  this.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};