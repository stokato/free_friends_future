/**
 * Удаляем запись о друге из базы
 *
 * @param String uid - ид пользователя, String fid - ид друга, callback
 * @return uid - ид пользователя
 */

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

module.exports = function(uid, fid, callback) {
  
  const DBF     = DB_CONST.USER_FRIENDS.fields;
  const DBN     = DB_CONST.USER_FRIENDS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }

  let condFieldsArr  = [DBF.USERID_uuid_pi];
  let condValuesArr  = [1];
  let paramsArr      = [uid];

  if(fid) {
    condFieldsArr.push([DBF.FRIENDID_uuid_c]);
    condValuesArr.push(1);
    paramsArr.push(fid);
  }

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);
  
  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }

    callback(null, uid);
  });

};