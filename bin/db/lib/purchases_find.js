var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти все покупки пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {

  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var f = C.IO.FIELDS;

  var fields = [f.id, f.goodid];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields , C.T_USERGOODS, [f.userid], [1]);

  this.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var goods = [];

    var i;
    for (i = 0; i < result.rows.length; i++) {
      var row = result.rows[i];

      var good = {};
      good[f.id] = row[f.id].toString();
      good[f.goodid] = row[f.goodid].toString();

      goods.push(good);
    }

    callback(null, goods);
  });
};