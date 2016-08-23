var constants = require('../../constants');
var cdb = require('./../../cassandra_db');

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodtype, callback) {
  if(!goodtype) { return callback(new Error("Не задан тип товаров")); }

  //var f = C.IO.FIELDS;

  var fields = ["id", "title", "type", "price", "src", "title"];
  var constFields = ["goodtype"];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_SHOP, constFields, constValues);

  cdb.client.execute(query,[goodtype], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    var goods = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {

      var good = result.rows[i];
      good.id = good.id.toString();
      //good.src = good.src;

      goods.push(good);
    }


    callback(null, goods);
  });
};