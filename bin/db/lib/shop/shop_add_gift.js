const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');
const Config = require('./../../../../config.json');

const DBF = dbConst.SHOP.fields;
const PF  = constants.PFIELDS;
/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};

let type = Config.good_types.gift;
  
  if ( !options[PF.ID] ||
    !options[PF.TITLE] ||
    !options[PF.PRICE] ||
    !options[PF.SRC] ||
    !options[PF.GROUP] ||
    !options[PF.GROUP_TITLE] ||
    !options[PF.TYPE] ||
    !PF.LEVEL in options ||
    !PF.RANK in options) {
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
    DBF.GROUP_TITLE_varchar,
    DBF.GIFT_TYPE_varchar,
    DBF.GIFT_RANK_varchar,
    DBF.GIFT_LEVEL_varchar
  ];
  
  let params = [
    options[PF.ID],
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.SRC],
    type,
    options[PF.GROUP],
    options[PF.GROUP_TITLE],
    options[PF.TYPE],
    options[PF.RANK],
    options[PF.LEVEL]
  ];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.SHOP.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    // options[PF.ID] = id;
    
    callback(null, options);
  });
};


