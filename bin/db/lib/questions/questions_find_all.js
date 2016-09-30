var constants = require('../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти все вопосы для игры questions
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {

  var fields = ["id", "text"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_QUESTIONS);

  cdb.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var questions = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {

      var good = result.rows[i];
      good.id = good.id.toString();

      questions.push(good);
    }
    callback(null, questions);
  });
};