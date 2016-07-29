var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти все вопосы для игры questions
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
  //var f = C.IO.FIELDS;

  var fields = ["id", "text"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_QUESTIONS);

  this.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var questions = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      //var row = result.rows[i];
      //
      //var good = {};
      //good[f.id]  = row[f.id].toString();
      //good[f.text] = row[f.text];

      var good = result.rows[i];
      good.id = good.id.toString();

      questions.push(good);
    }
    callback(null, questions);
  });
};