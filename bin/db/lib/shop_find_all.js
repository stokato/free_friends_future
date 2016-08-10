var C = require('../constants');
var qBuilder = require('./build_query');
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
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_SHOP, ["goodtype"], [1]);

  this.client.execute(query,[goodtype], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    var goods = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      //var row = result.rows[i];
      //
      //var good = {};
      //good[f.id]  = row[f.id].toString();
      //good[f.title] = row[f.title];
      //good[f.type]  = row[f.type];
      //good[f.price] = row[f.price];
      //good[f.data]  = row[f.data];
      //good[f.title] = row[f.title];

      var good = result.rows[i];
      good.id = good.id.toString();
      good.src = good.src;

      goods.push(good);
    }


    callback(null, goods);
  });
};