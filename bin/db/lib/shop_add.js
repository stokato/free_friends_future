var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  var f = C.IO.FIELDS;

  if ( !options[f.title] || !options[f.price] || !options[f.data] || !options[f.type]) {
    return callback(new Error("Не указаны необходимые поля товара"), null);
  }

  var id = this.uuid.random();

  var fields = [f.id, f.title, f.price, f.data, f.type];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_SHOP);

  var params = [id, options[f.title], options[f.price], options[f.data], options[f.type]];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[f.id] = id;

    callback(null, options);
  });
};