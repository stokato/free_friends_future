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
  
  const DBF = DB_CONST.COINS.fields;
  const DBN = DB_CONST.COINS.name;
  
  if(!goodid) {
    return callback(new Error("Не задан ИД товара"), null);
  }
  
  let fieldsArr = [
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  let condFieldsArr = [DBF.ID_varchar_p];
  let condValuesArr = [1];
  let paramsArr     = [goodid];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(null, null);
    }

    let rowObj = result.rows[0];
    
    let resObj = {
      [PF.ID]        : goodid,
      [PF.TITLE]     : rowObj[DBF.TITLE_varchar],
      [PF.PRICE]     : rowObj[DBF.PRICE_COINS_int],
      [PF.PRICE_VK]  : rowObj[DBF.PRICE_VK_int],
      [PF.SRC]       : rowObj[DBF.SRC_varchar]
    };
    
    callback(null, resObj);
  });
};