/*
 Найти все покупки пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {

  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var query = "select id, goodid FROM user_goods where userid = ?";

  this.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var goods = [];

    var i;
    for (i = 0; i < result.rows.length; i++) {
      var row = result.rows[i];

      var good = {
        id: row.id,
        goodid: row.goodid
      };

      goods.push(good);
    }

    callback(null, goods);
  });
};