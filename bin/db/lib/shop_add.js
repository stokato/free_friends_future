/*
 Добавить товар в БД: ИД, объект с данными
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) {
 var good    = options || {};
 var goodId  = good.id;
 var title   = good.title;
 var price   = good.price;
 var data    = good.data;
 var type    = good.type;

 if ( !goodId || !title || !price || !data || !type) {
   return callback(new Error("Не указан Id товара"), null);
 }

 var id = this.uuid.random();

 var fields = "id, title, price, data, type";
 var values = "?, ?, ?, ?, ?";

 var params = [id, goodId, title, price, data, type];

 var query = "INSERT INTO shop (" + fields + ") VALUES (" + values + ")";

 this.client.execute(query, params, {prepare: true },  function(err) {
   if (err) {  return callback(err); }

   callback(null, good);
 });
};