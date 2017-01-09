const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.SHOP.fields;
const PF  = dbConst.PFIELDS;

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodtype, callback) {
  if(!goodtype) { return callback(new Error("Не задан тип товаров")); }

  let fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.TYPE_varchar,
    DBF.PRICE_int,
    DBF.SRC_varchar
  ];
  
  let constFields = [DBF.GOODTYPE_varchar_i];
  let constValues = [1];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.SHOP.name, constFields, constValues);

  cdb.client.execute(query,[goodtype], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    let goods = [], good, row;

    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      good = {
        [PF.ID]    : row[DBF.ID_varchar_p],
        [PF.TITLE] : row[DBF.TITLE_varchar],
        [PF.TYPE]  : row[DBF.TYPE_varchar],
        [PF.PRICE] : row[DBF.PRICE_int],
        [PF.SRC]   : row[DBF.SRC_varchar]
      };

      goods.push(good);
    }

    callback(null, goods);
  });
};