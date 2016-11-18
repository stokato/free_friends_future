var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Удалить все подарки игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех подарков игрока (нужны их ИД для удаления)
 - Удаляем подарки отобранных игроков
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем все подарки
  var fields = ["id", "userid"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERGIFTS, ["userid"], [1]);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    var params = [];
    var constValues = result.rows.length;
    
    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i]);
    }
    
    var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERGIFTS, ["id"], [constValues]);
    cdb.client.execute(query, [params], { prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, uid);
    });
  });
};