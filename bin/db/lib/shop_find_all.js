/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
 var query = "select id, title, type, price, data FROM shop";

 this.client.execute(query,[], {prepare: true }, function(err, result) {
   if (err) { return callback(err, null); }

   if(result.rows.length == 0) return callback(null, null);

   var goods = [];

   for (var i = 0; i < result.rows.length; i++) {
     var row = result.rows[i];

     var good = {
       giftid: row.id,
       title: row.title,
       type : row.type,
       price: row.price,
       data:  row.data
     };

     goods.push(good);
   }
   callback(null, goods);
 });
};