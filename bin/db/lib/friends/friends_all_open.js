/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Снимаем поментку Новый со всех друзей пользователя
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем всех новых друзей
  var fields = ["friendid"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USER_NEW_FRIENDS, ["userid"], [1]);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    var params = [uid];
    var constFields = ["userid", "friendid"];
    var constValues = [ 1, result.rows.length ];
    
    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i]);
    }
    
    var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USER_NEW_FRIENDS, constFields, constValues);
    cdb.client.execute(query, [params], { prepare: true }, function(err) {
      if (err) { return callback(err); }
      
      callback(null, uid);
    });
  });
};