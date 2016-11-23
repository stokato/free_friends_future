var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.SHOP.fields;
var PF = dbConst.PFIELDS;

/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};

  if ( !options[PF.TITLE] || !options[PF.PRICE] || !options[PF.SRC] || !options[PF.GOODTYPE]) {
    return callback(new Error("Не указаны необходимые поля товара"), null);
  }

  var id = cdb.uuid.random();

  var fields = [
    DBF.ID_varchar_p,
    DBF.TITLE_varchar,
    DBF.PRICE_int,
    DBF.SRC_varchar,
    DBF.TYPE_varchar,
    DBF.GOODTYPE_varchar_i
  ];
  
  var params = [
    id,
    options[PF.TITLE],
    options[PF.PRICE],
    options[PF.SRC],
    options[PF.TYPE],
    options[PF.GOODTYPE]
  ];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.SHOP.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[PF.ID] = id;

    callback(null, options);
  });
};


