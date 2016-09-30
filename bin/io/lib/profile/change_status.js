
var oPool = require('./../../../objects_pool');

/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];
    selfProfile.setStatus(options.status, function (err, status) {
      if (err) { return callback(err); }
      
      callback(null, { status : status });
    });
  
};


