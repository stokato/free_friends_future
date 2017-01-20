const dbCtrlr   = require('./../common/cassandra_db');
const Config    = require('./../../../../config.json');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  
  const DBF = DB_CONST.SHOP.fields;
  const DBN = DB_CONST.SHOP.name;
  const GOOD_TYPE = Config.good_types.gift;
  
  if ( //!options[PF.ID] ||
  !PF.TITLE in options ||
  !options[PF.PRICE] ||
  !options[PF.SRC] ||
  !options[PF.GROUP] ||
  !options[PF.GROUP_TITLE] ||
  !options[PF.TYPE] ||
  !PF.LEVEL in options ||
  !PF.RANK in options) {
    return callback(new Error("Не указаны необходимые поля подарка"), null);
  }
  
  let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [
    DBF.ID_uuid_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.SRC_varchar,
    DBF.TYPE_varchar_i,
    DBF.GROUP_varchar,
    DBF.GROUP_TITLE_varchar,
    DBF.GIFT_TYPE_varchar,
    DBF.GIFT_RANK_varchar,
    DBF.GIFT_LEVEL_int
  ];
  
  let paramsArr = [
    id,
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.SRC],
    GOOD_TYPE,
    options[PF.GROUP],
    options[PF.GROUP_TITLE],
    options[PF.TYPE],
    options[PF.RANK],
    options[PF.LEVEL]
  ];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
    if (err) {
      return callback(err);
    }
    
    options[PF.ID] = id;
    
    callback(null, options);
  });
};


