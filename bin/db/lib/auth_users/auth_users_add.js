/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Регистрируем пользователя
 *
 */
const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF       = require('./../../../const_fields');

module.exports = function(options, callback) { options = options || {};
  const DBF = DB_CONST.AUTH_USERS.fields;
  const DBNAME = DB_CONST.AUTH_USERS.name;
  
  if (!options[PF.LOGIN] || !options[PF.PASSWORD]) {
    return callback(new Error("Не задан логин или пароль пользователя"), null);
  }
  
  let id = dbCtrlr.uuid.random();
  
  let fieldsArr = [DBF.ID_uuid_p, DBF.LOGIN_varchar_i, DBF.PASSWORD_varchar];
  let paramsArr  = [id, options[PF.LOGIN], options[PF.PASSWORD]];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNAME);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id.toString();
    
    callback(null, options);
  });
};
