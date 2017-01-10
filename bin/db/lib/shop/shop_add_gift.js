const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');
const Config = require('./../../../../config.json');

const DBF = dbConst.SHOP.fields;
const PF  = constants.PFIELDS;
CONST_TYPE = Config.good_types.gift;
/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  
  if ( !options[PF.ID] ||
    !options[PF.TITLE] ||
    !options[PF.PRICE] ||
    !options[PF.SRC] ||
    !options[PF.GROUP] ||
    !options[PF.GROUP_TITLE]) {
    return callback(new Error("Не указаны необходимые поля подарка"), null);
  }
  
  // let id = cdb.uuid.random();
  
  let fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.SRC_varchar,
    DBF.TYPE_varchar_i,
    DBF.GROUP_varchar,
    DBF.GROUP_TITLE_varchar
  ];
  
  let params = [
    options[PF.ID],
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.SRC],
    CONST_TYPE,
    options[PF.GROUP],
    options[PF.GROUP_TITLE]
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.SHOP.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    // options[PF.ID] = id;
    
    callback(null, options);
  });
};


