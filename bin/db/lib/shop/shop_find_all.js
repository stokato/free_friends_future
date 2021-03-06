const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */

module.exports = function(type, callback) {
  
  const DBF = DB_CONST.SHOP.fields;
  const DBN = DB_CONST.SHOP.name;
  
  if(!type) {
    return callback(new Error("Не задан тип товаров"));
  }

  let fieldsArr = [
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
  
  let condFieldsArr = [DBF.TYPE_varchar_i];
  let condValuesArr = [1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query,[type], { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(null, []);
    }

    let goodsArr = [];

    let rowsLen = result.rows.length;
    for (let i = 0; i < rowsLen; i++) {
      let rowObj = result.rows[i];
      
      let goodObj = {
        [PF.ID]           : rowObj[DBF.ID_uuid_p],
        [PF.TITLE]        : rowObj[DBF.TITLE_varchar],
        [PF.GOODTYPE]     : rowObj[DBF.TYPE_varchar_i],
        [PF.PRICE]        : rowObj[DBF.PRICE_COINS_int],
        [PF.SRC]          : rowObj[DBF.SRC_varchar],
        [PF.GROUP]        : rowObj[DBF.GROUP_varchar],
        [PF.GROUP_TITLE]  : rowObj[DBF.GROUP_TITLE_varchar],
        [PF.TYPE]         : rowObj[DBF.GIFT_TYPE_varchar],
        [PF.RANK]         : rowObj[DBF.GIFT_RANK_varchar],
        [PF.LEVEL]        : rowObj[DBF.GIFT_LEVEL_int]
      };

      goodsArr.push(goodObj);
    }

    callback(null, goodsArr);
  });
};