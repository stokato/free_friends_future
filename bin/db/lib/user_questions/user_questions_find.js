/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы пользователей по списку ид, либо просто порцию
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_QUESTIONS.fields;
var PF = dbConst.PFIELDS;
var constants = require('./../../../constants');

module.exports = function(ids, callback) {
  
  var fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.USERID_uuid,
    DBF.USERVID_varchar
  ];
  var constFields = null;
  var constValues = null;
  var limit = null;
  var dbName = dbConst.DB.USER_QUESTIONS.name;
  var params = [];
  
  if(ids) {
    constFields = [DBF.ID_uuid_p];
    constValues = [ids.length];
    
    for(var i = 0; i < ids.length; i++) {
      params.push(ids[i]);
    }
  } else {
    limit = constants.QUESTIONS_COUNT;
  }
    
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues, null, null, null, limit);
  
  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
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
      question[PF.FID]     = row[DBF.USERID_uuid].toString();
      question[PF.FVID]    = row[DBF.USERVID_varchar];
      
      questions.push(question);
    }
    
    callback(null, questions);
  });
};
