var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.SHOP.fields;
var PF = dbConst.PFIELDS;

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodtype, callback) {
  if(!goodtype) { return callback(new Error("Не задан тип товаров")); }

  var fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.TYPE_varchar,
    DBF.PRICE_int,
    DBF.SRC_varchar
  ];
  
  var constFields = [DBF.GOODTYPE_varchar_i];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.SHOP.name, constFields, constValues);

  cdb.client.execute(query,[goodtype], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    var goods = [], good, row;

    for (var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      good = {};
      good[PF.ID]     = row[DBF.ID_varchar_p];
      good[PF.TITLE]  = row[DBF.TITLE_varchar];
      good[PF.TYPE]   = row[DBF.TYPE_varchar];
      good[PF.PRICE]  = row[DBF.PRICE_int];
      good[PF.SRC]    = row[DBF.SRC_varchar];

      goods.push(good);
    }

    callback(null, goods);
  });
};