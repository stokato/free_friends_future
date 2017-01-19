/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Ищем регистрацию пользователя по ид или логину
 *
 */

const dbCtrlr = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF      = require('./../../../const_fields');

module.exports = function(id, login, callback) {
  
  const DBF    = DB_CONST.AUTH_USERS.fields;
  const DBNAME = DB_CONST.AUTH_USERS.name;
  
  if (!login && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или логин"), null);
  }
  
  let constraint = '';
  let param = [];
  
  if(id) {
    constraint = DBF.ID_uuid_p;
    param.push(id);
  } else {
    constraint = DBF.LOGIN_varchar_i;
    param.push(login);
  }
  
  let fieldsArr = [DBF.ID_uuid_p, DBF.LOGIN_varchar_i, DBF.PASSWORD_varchar];
  let condFieldsArr = [constraint];
  let condValuesArr = [1];
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNAME, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length > 0) {
      
      let row = result.rows[0];
      
      let user = {
        [PF.ID]       : row[DBF.ID_uuid_p].toString(),
        [PF.LOGIN]    : row[DBF.LOGIN_varchar_i],
        [PF.PASSWORD] : row[DBF.PASSWORD_varchar]
      };
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
