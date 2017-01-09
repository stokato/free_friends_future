/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Регистрируем пользователя
 *
 */
const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.AUTH_USERS.fields;
const PF  = dbConst.PFIELDS;

module.exports = function(options, callback) { options = options || {};
  if (!options[PF.LOGIN] || !options[PF.PASSWORD]) {
    return callback(new Error("Не задан логин или пароль пользователя"), null);
  }
  
  let id = cdb.uuid.random();
  
  let fields = [DBF.ID_uuid_p, DBF.LOGIN_varchar_i, DBF.PASSWORD_varchar];
  let params = [id, options[PF.LOGIN], options[PF.PASSWORD]];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.AUTH_USERS.name);
  
  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }
    
    options[PF.ID] = id.toString();
    
    callback(null, options);
  });
};
