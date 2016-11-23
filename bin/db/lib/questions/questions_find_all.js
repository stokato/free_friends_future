var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.QUESTIONS.fields;
var PF = dbConst.PFIELDS;

/*
 Найти все вопосы для игры questions
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {

  var fields = [DBF.ID_uuid_p, DBF.TEXT_varchar];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.QUESTIONS.name);

  cdb.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var questions = [], question, row;

    for (var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      question = {};
      question[PF.ID]   = row[DBF.ID_uuid_p].toString();
      question[PF.TEXT] = row[DBF.TEXT_varchar];
      
      questions.push(question);
    }
    
    callback(null, questions);
  });
};