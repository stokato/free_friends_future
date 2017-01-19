const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
  
  const DBF = DB_CONST.COINS.fields;
  const DBN = DB_CONST.COINS.name;
  
  let fieldsArr = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN);

  dbCtrlr.client.execute(query,[], {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(null, []);
    }

    let goodsArr = [];
    let goodObj;
    let rowObj;

    let rowsLen = result.rows.length;
    for (let i = 0; i < rowsLen; i++) {
      rowObj = result.rows[i];
      
      goodObj = {
        [PF.ID]           : rowObj[DBF.ID_uuid_p],
        [PF.TITLE]        : rowObj[DBF.TITLE_varchar],
        [PF.PRICE]        : rowObj[DBF.PRICE_COINS_int],
        [PF.PRICE_VK]     : rowObj[DBF.PRICE_VK_int],
        [PF.SRC]          : rowObj[DBF.SRC_varchar]
      };

      goodsArr.push(goodObj);
    }

    callback(null, goodsArr);
  });
};