/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы пользователей по списку ид, либо просто порцию
 */

const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.USER_QUESTIONS.fields;

module.exports = function(ids, callback) {
  
  let fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.USERID_uuid,
    DBF.USERVID_varchar
  ];
  let constFields = null;
  let constValues = null;
  let limit = null;
  let dbName = DB_CONST.USER_QUESTIONS.name;
  let params = [];
  
  if(ids) {
    constFields = [DBF.ID_uuid_p];
    constValues = [ids.length];
    
    for(let i = 0; i < ids.length; i++) {
      params.push(ids[i]);
    }
  } else {
    limit = 100;
  }
    
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, dbName, constFields, constValues, null, null, null, limit);
  
  dbCtrlr.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length == 0) return callback(null, null);
    
    let questions = [], question, row;
    
    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      question = {
        [PF.ID]      : row[DBF.ID_uuid_p].toString(),
        [PF.TEXT]    : row[DBF.TEXT_varchar],
        [PF.IMAGE_1] : row[DBF.IMAGE1_varchar],
        [PF.IMAGE_2] : row[DBF.IMAGE2_varchar],
        [PF.IMAGE_3] : row[DBF.IMAGE3_varchar],
        [PF.FID]     : row[DBF.USERID_uuid].toString(),
        [PF.FVID]    : row[DBF.USERVID_varchar]
      };
      
      questions.push(question);
    }
    
    callback(null, questions);
  });
};
