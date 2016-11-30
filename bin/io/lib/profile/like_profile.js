/**
 * Добавляем лайк к профилю пользователя, добавляем ему очки
 *
 * @param socket, options - объект с ид пользователя, callback
 *
 */
var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    oPool     = require('./../../../objects_pool'),
    ProfileJS = require('./../../../profile/index');


module.exports = function (socket, options, callback) {
 
  var selfProfile = oPool.userList[socket.id];
  var friendProfile = oPool.profiles[options[PF.ID]];
  
  if(selfProfile.getID() == options[PF.ID]) {
    return callback(constants.errors.SELF_ILLEGAL);
  }
  
  // Получаем замок и проверяем, не заблокирована ли возможнасть ставить лайк
  var lock = String(selfProfile.getID() + "_" + options[PF.ID]);
  
  // Если таймаут еще не истек, ничего не начисляем
  if(oPool.likeLocks[lock]) {
    return callback(null, null);
  }
  
  // Добавляе мочки
  if(friendProfile) {
    friendProfile.addPoints(constants.LIKE_BONUS_POINTS, onPoints(friendProfile));
  } else {
    friendProfile = new ProfileJS();
    friendProfile.build(options[PF.ID], function (err) {
      if(err) { return callback(err);  }
      
      friendProfile.addPoints(constants.LIKE_BONUS_POINTS, onPoints(friendProfile));
    });
  }
  
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, points) {
      if(err) { return callback(err); }
      
      var res = {};
      res[PF.POINTS] = points;
      
      var socket = player.getSocket();
      socket.emit(constants.IO_ADD_POINTS, res);
      
      oPool.likeLocks[lock] = true;
      
      setLikeTimeout(oPool.likeLocks, selfProfile.getID(), constants.TIMEOUT_LIKE);
      
      callback(null, null);
    }
  }
  
  // Функция блокирует добавление лайков от этого пользователя на заданный период времени
  function setLikeTimeout(locks, selfid, friendid, delay) {
    setTimeout(function () {
      var lock = String(selfid + "_" + friendid);
      delete locks[lock];
    }, delay);
  }
};