/**
 * Created by s.t.o.k.a.t.o on 16.12.2016.
 *
 * Удаляем статистику по пользователю
 *
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS_STAT.fields;

module.exports = function(id, vid, callback) {
  if (!id) { callback(new Error("Задан пустой ID или VID")); }
  
  var dbName = dbConst.DB.USERS_STAT.name;
  var constFields = [DBF.ID_uuid_pc1i, DBF.VID_varchar_pc2i];
  var constValues = [1, 1];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
  
  cdb.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }
    
    callback(null, id);
  });
};
