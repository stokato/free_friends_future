var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodid, callback) {
  if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

  //var f = C.IO.FIELDS;

  var fields = ["title", "type", "price", "data", "goodtype", "price2"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_SHOP, ["id"], [1]);

  this.client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }
    //var row = result.rows[0];
    //
    //var good = {};
    //good[f.id]  = goodid;
    //good[f.title] = row[f.title];
    //good[f.type]  = row[f.type];
    //good[f.price] = row[f.price];
    //good[f.data]  = row[f.data];
    //good[f.goodtype] = row[f.goodtype];
    //good[f.price2] = row[f.price2];

    var good = result.rows[0];
    good.id = goodid;

    callback(null, good);
  });
};