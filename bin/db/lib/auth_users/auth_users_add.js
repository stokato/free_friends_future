/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Регистрируем пользователя
 *
 */
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.AUTH_USERS.fields;
var PF = dbConst.PFIELDS;

module.exports = function(options, callback) { options = options || {};
  if (!options[PF.LOGIN] || !options[PF.PASSWORD]) {
    return callback(new Error("Не задан логин или пароль пользователя"), null);
  }
  
  var id = cdb.uuid.random();
  
  var fields = [DBF.ID_uuid_p, DBF.LOGIN_varchar_i, DBF.PASSWORD_varchar];
  var params = [id, options[PF.LOGIN], options[PF.PASSWORD]];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.AUTH_USERS.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id.toString();
    
    callback(null, options);
  });
};
