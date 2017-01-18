const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');
const Config = require('./../../../../config.json');

const DBF = dbConst.COINS.fields;
const PF  = constants.PFIELDS;
/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  
  if (!options[PF.ID] ||
    !options[PF.TITLE] ||
    !options[PF.PRICE] ||
    !options[PF.PRICE_VK] ||
    !options[PF.SRC]) {
    return callback(new Error("Не указаны необходимые поля лота"), null);
  }
  
  // let id = cdb.uuid.random();
  
  let fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  let params = [
    options[PF.ID], //id,
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.PRICE_VK],
    options[PF.SRC]
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.COINS.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    // options[PF.ID] = id;
    
    callback(null, options);
  });
};


