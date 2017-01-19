const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST    = require('./../../constants');
const PF          = require('./../../../const_fields');

/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};

  const DBF = DB_CONST.COINS.fields;
  const DBN = DB_CONST.COINS.name;
  
  if (!options[PF.ID] ||
    !options[PF.TITLE] ||
    !options[PF.PRICE] ||
    !options[PF.PRICE_VK] ||
    !options[PF.SRC]) {
    return callback(new Error("Не указаны необходимые поля лота"), null);
  }
  
  // let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_COINS_int,
    DBF.PRICE_VK_int,
    DBF.SRC_varchar
  ];
  
  let paramsArr = [
    options[PF.ID], //id,
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.PRICE_VK],
    options[PF.SRC]
  ];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true },  (err) => {
    if (err) {
      return callback(err);
    }
    
    // options[PF.ID] = id;
    
    callback(null, options);
  });
};


