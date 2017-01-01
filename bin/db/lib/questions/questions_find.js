/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получить список вопросов из базы данных
 *
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.QUESTIONS.fields;
var PF = dbConst.PFIELDS;

module.exports = function(ids, callback) { ids = ids || [];
  
  var fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar
  ];
  
  var constFields = [DBF.ID_uuid_p];
  var constValues = [ids.length];
  var dbName = dbConst.DB.QUESTIONS.name;
  var params = [];
  
  for(var i = 0; i < ids.length; i++) {
    params.push(ids[i]);
  }
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length == 0) return callback(null, null);
    
    var questions = [], question, row;
    
    for (var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      question = {};
      question[PF.ID]      = row[DBF.ID_uuid_p].toString();
      question[PF.TEXT]    = row[DBF.TEXT_varchar];
      question[PF.IMAGE_1] = row[DBF.IMAGE1_varchar];
      question[PF.IMAGE_2] = row[DBF.IMAGE2_varchar];
      question[PF.IMAGE_3] = row[DBF.IMAGE3_varchar];
      
      questions.push(question);
    }
    
    callback(null, questions);
  });
};

