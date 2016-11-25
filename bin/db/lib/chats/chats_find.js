var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBC = dbConst.DB.USER_CHATS;
var DBF = DBC.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти пользователей, с которыми были чаты, показать наличине новых сообщений
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с пользователями (если ничего нет null)
 */

module.exports = function(uid, callback) {
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  var params = [uid];
  
  var fields = [
    DBF.COMPANIONID_uuid_c,
    DBF.ISNEW_boolean,
    DBF.COMPANIONBDATE_timestamp,
    DBF.COMPANIONSEX_int,
    DBF.COMPANIONVID_varchar
  ];
  
  var const_fields = [DBF.USERID_uuid_p];
  var const_values = [1];
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, DBC.name, const_fields, const_values);
  
  cdb.client.execute(query, params, {prepare: true}, function (err, result) {
    if (err) { return callback(err, null); }
    
    var row, user, users = [];

    var countNew    = 0;
    
    for (var i = 0; i < result.rows.length; i++) {
      row = result.rows[i];
      
      user = {};
      user[PF.ID]     = row[DBF.COMPANIONID_uuid_c].toString();
      user[PF.VID]    = row[DBF.COMPANIONVID_varchar];
      user[PF.AGE]    = bdayToAge(row[DBF.COMPANIONBDATE_timestamp]);
      user[PF.SEX]    = row[DBF.COMPANIONSEX_int];
      user[PF.ISNEW]  = row[DBF.ISNEW_boolean];
      
      users.push(user);
      
      if(user[PF.ISNEW] == true) {
        countNew++;
      }
    }
    
    var res = {};
    res[PF.CHATS] = users;
    res[PF.NEWCHATS] = countNew;
    
    callback(null, res);
  });
};