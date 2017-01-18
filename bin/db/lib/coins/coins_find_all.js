const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.COINS.fields;
const PF  = constants.PFIELDS;

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
  
  let fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.COINS.name);

  cdb.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, []);

    let goods = [], good, row;

    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      good = {
        [PF.ID]           : row[DBF.ID_uuid_p],
        [PF.TITLE]        : row[DBF.TITLE_varchar],
        [PF.PRICE]        : row[DBF.PRICE_COINS_int],
        [PF.PRICE_VK]     : row[DBF.PRICE_VK_int],
        [PF.SRC]          : row[DBF.SRC_varchar]
      };

      goods.push(good);
    }

    callback(null, goods);
  });
};