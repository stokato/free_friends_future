var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF  = require('./../../constants').PFIELDS;

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

  var fields = ["id", "title", "price", "src", "type", "goodtype"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_SHOP);

  var params = [id, options[PF.TITLE], options[PF.PRICE], options[PF.SRC], options[PF.TYPE], options[PF.GOODTYPE]];

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[PF.ID] = id;

    callback(null, options);
  });
};


