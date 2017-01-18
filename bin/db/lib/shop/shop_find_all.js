const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.SHOP.fields;
const PF  = constants.PFIELDS;

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(type, callback) {
  if(!type) { return callback(new Error("Не задан тип товаров")); }

  let fields = [
    DBF.ID_uuid_p,
    DBF.TITLE_varchar,
    DBF.TYPE_varchar_i,
    DBF.PRICE_COINS_int,
    DBF.SRC_varchar,
    DBF.GROUP_varchar,
    DBF.GROUP_TITLE_varchar,
    DBF.GIFT_TYPE_varchar,
    DBF.GIFT_RANK_varchar,
    DBF.GIFT_LEVEL_int
  ];
  
  let constFields = [DBF.TYPE_varchar_i];
  let constValues = [1];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.SHOP.name, constFields, constValues);

  cdb.client.execute(query,[type], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    let goods = [], good, row;

    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      good = {
        [PF.ID]           : row[DBF.ID_uuid_p],
        [PF.TITLE]        : row[DBF.TITLE_varchar],
        [PF.GOODTYPE]     : row[DBF.TYPE_varchar_i],
        [PF.PRICE]        : row[DBF.PRICE_COINS_int],
        [PF.SRC]          : row[DBF.SRC_varchar],
        [PF.GROUP]        : row[DBF.GROUP_varchar],
        [PF.GROUP_TITLE]  : row[DBF.GROUP_TITLE_varchar],
        [PF.TYPE]         : row[DBF.GIFT_TYPE_varchar],
        [PF.RANK]         : row[DBF.GIFT_RANK_varchar],
        [PF.LEVEL]        : row[DBF.GIFT_LEVEL_int]
      };

      goods.push(good);
    }

    callback(null, goods);
  });
};