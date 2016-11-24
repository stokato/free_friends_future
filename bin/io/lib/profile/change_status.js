var constants = require('./../../../constants');
var oPool = require('./../../../objects_pool');

/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
module.exports = function (socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  selfProfile.setStatus(options[constants.PFIELDS.STATUS], function (err, status) {
    if (err) { return callback(err); }
    
    var res = {};
    res[constants.PFIELDS.STATUS] = status;
    
    callback(null, res);
  });
  
};


