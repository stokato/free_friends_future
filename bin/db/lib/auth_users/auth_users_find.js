/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Ищем регистрацию пользователя по ид или логину
 *
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.AUTH_USERS.fields;
var PF = dbConst.PFIELDS;

module.exports = function(id, login, callback) {
  if (!login && !id) {
    return callback(new Error("Ошибка при поиске пользователя: Не задан ID или логин"), null);
  }
  
  var constraint = '';
  var param = [];
  
  if(id) {
    constraint = DBF.ID_uuid_p;
    param.push(id);
  } else {
    constraint = DBF.LOGIN_varchar_i;
    param.push(login);
  }
  
  var fields = [DBF.ID_uuid_p, DBF.LOGIN_varchar_i, DBF.PASSWORD_varchar];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbConst.DB.AUTH_USERS.name, [constraint], [1]);
  
  cdb.client.execute(query, param, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    if(result.rows.length > 0) {
      
      var row = result.rows[0];
      
      var user = {};
      user[PF.ID]         = row[DBF.ID_uuid_p].toString();
      user[PF.LOGIN]      = row[DBF.LOGIN_varchar_i];
      user[PF.PASSWORD]   = row[DBF.PASSWORD_varchar];
      
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
