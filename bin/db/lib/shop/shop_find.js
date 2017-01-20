const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти товар: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем данные по товару (Если не нашли ничего - NULL)
 */

module.exports = function(goodid, callback) {
  
  const DBF = DB_CONST.SHOP.fields;
  const DBN = DB_CONST.SHOP.name;
  
  if(!goodid) {
    return callback(new Error("Не задан ИД товара"), null);
  }

  const fieldsArr = [
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
  
  const condFieldsArr = [DBF.ID_uuid_p];
  const condValuesArr = [1];

  const query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query,[goodid], { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(null, null);
    }

    const rowObj = result.rows[0];
    
    const goodObj = {
      [PF.ID]           : goodid,
      [PF.TITLE]        : rowObj[DBF.TITLE_varchar],
      [PF.GOODTYPE]     : rowObj[DBF.TYPE_varchar_i],
      [PF.PRICE]        : rowObj[DBF.PRICE_COINS_int],
      [PF.SRC]          : rowObj[DBF.SRC_varchar],
      [PF.GROUP]        : rowObj[DBF.GROUP_varchar],
      [PF.GROUP_TITLE]  : rowObj[DBF.GROUP_TITLE_varchar],
      [PF.TYPE]         : rowObj[DBF.GIFT_TYPE_varchar],
      [PF.RANK]         : rowObj[DBF.RANK],
      [PF.LEVEL]        : rowObj[DBF.LEVEL]
    };
    
    callback(null, goodObj);
  });
};