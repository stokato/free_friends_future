const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.COINS.fields;
const PF  = constants.PFIELDS;

/*
 Найти товар: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем данные по товару (Если не нашли ничего - NULL)
 */
module.exports = function(goodid, callback) {
  if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

  const fields = [
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  const constFields = [DBF.ID_varchar_p];
  const constValues = [1];

  const query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.COINS.name, constFields, constValues);

  cdb.client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    const row = result.rows[0];
    
    const good = {
      [PF.ID]           : goodid,
      [PF.TITLE]        : row[DBF.TITLE_varchar],
      [PF.PRICE]        : row[DBF.PRICE_COINS_int],
      [PF.PRICE_VK]     : row[DBF.PRICE_VK_int],
      [PF.SRC]          : row[DBF.SRC_varchar]
    };
    
    callback(null, good);
  });
};