const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.QUESTIONS.fields;
const PF  = constants.PFIELDS;

/*
 Изменяем данные вопроса
 */
module.exports = function(options, callback) { options = options || {};
  
  if (!options[PF.ID]) {
    return callback(new Error("Задан пустй Id вопроса"), null);
  }
  
  let fields = [];
  let constFields = [DBF.ID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.QUESTIONS.name;
  
  let params = [];
  if (PF.TEXT in options)      { fields.push(DBF.TEXT_varchar);     params.push(options[PF.TEXT]); }
  if (PF.IMAGE_1 in options)   { fields.push(DBF.IMAGE1_varchar);   params.push(options[PF.IMAGE_1]); }
  if (PF.IMAGE_2 in options)   { fields.push(DBF.IMAGE2_varchar);   params.push(options[PF.IMAGE_2]); }
  if (PF.IMAGE_3 in options)   { fields.push(DBF.IMAGE3_varchar);   params.push(options[PF.IMAGE_3]); }
  if (PF.ACTIVITY in options)  { fields.push(DBF.ACTIVITY_boolean); params.push(!!options[PF.ACTIVITY]); }
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, dbName, constFields, constValues);
  
  params.push(options[PF.ID]);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  });
};