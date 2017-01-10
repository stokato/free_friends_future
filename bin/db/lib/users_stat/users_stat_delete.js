/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Удаляем статистику по пользователю
 *
 */

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.USERS_STAT.fields;

module.exports = function(id, vid, callback) {
  if (!id) { callback(new Error("Задан пустой ID или VID")); }
  
  let dbName      = dbConst.USERS_STAT.name;
  let constFields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  let constValues = [1, 1];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, id);
  });
};
