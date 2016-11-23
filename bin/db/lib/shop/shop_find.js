var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.SHOP.fields;
var PF = dbConst.PFIELDS;

/*
 Найти товар: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем данные по товару (Если не нашли ничего - NULL)
 */
module.exports = function(goodid, callback) {
  if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

  var fields = [
    DBF.TITLE_varchar,
    DBF.TYPE_varchar,
    DBF.PRICE_int,
    DBF.SRC_varchar,
    DBF.GOODTYPE_varchar_i,
    DBF.PRICE2_int
  ];
  
  var constFields = [DBF.ID_varchar_p];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.SHOP.name, constFields, constValues);

  cdb.client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var row = result.rows[0];
    
    var good = {};
    good[PF.ID]         = goodid;
    good[PF.TITLE]      = row[DBF.TITLE_varchar];
    good[PF.TYPE]       = row[DBF.TYPE_varchar];
    good[PF.PRICE]      = row[DBF.PRICE_int];
    good[PF.PRICE2]     = row[DBF.PRICE2_int];
    good[PF.SRC]        = row[DBF.SRC_varchar];
    good[PF.GOODTYPE]   = row[DBF.GOODTYPE_varchar_i];
    
    callback(null, good);
  });
};