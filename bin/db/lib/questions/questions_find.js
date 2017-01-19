/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получить список вопросов из базы данных
 *
 */

const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.QUESTIONS.fields;

module.exports = function(ids, callback) { ids = ids || [];
  
  let fields = [
    DBF.ID_uuid_p,
    DBF.TEXT_varchar,
    DBF.IMAGE1_varchar,
    DBF.IMAGE2_varchar,
    DBF.IMAGE3_varchar,
    DBF.ACTIVITY_boolean
  ];
  
  let constFields = [DBF.ID_uuid_p];
  let constValues = [ids.length];
  let dbName = DB_CONST.QUESTIONS.name;
  let params = [];
  
  for(let i = 0; i < ids.length; i++) {
    params.push(ids[i]);
  }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  dbCtrlr.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length == 0) return callback(null, null);
    
    let questions = [], question, row;
    
    for (let i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      question = {
        [PF.ID]       : row[DBF.ID_uuid_p].toString(),
        [PF.TEXT]     : row[DBF.TEXT_varchar],
        [PF.IMAGE_1]  : row[DBF.IMAGE1_varchar],
        [PF.IMAGE_2]  : row[DBF.IMAGE2_varchar],
        [PF.IMAGE_3]  : row[DBF.IMAGE3_varchar],
        [PF.ACTIVITY] : row[DBF.ACTIVITY_boolean]
      };
      
      questions.push(question);
    }
    
    callback(null, questions);
  });
};

