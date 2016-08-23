var constants = require('../../constants');
var cdb = require('./../../cassandra_db');

/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  //var f = C.IO.FIELDS;

  if ( !options["title"] || !options["price"] || !options["src"] || !options["goodtype"]) {
    return callback(new Error("Не указаны необходимые поля товара"), null);
  }

  var id = cdb.uuid.random();

  var fields = ["id", "title", "price", "src", "type", "goodtype"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_SHOP);

  var params = [id, options["title"], options["price"], options["src"], options["type"], options["goodtype"]];

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options["id"] = id;

    callback(null, options);
  });
};


