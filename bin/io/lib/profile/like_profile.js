var constants = require('./../../../constants');

var oPool = require('./../../../objects_pool');
var ProfileJS = require('./../../../profile/index');

// Добавляем пользователю очки
module.exports = function (socket, options, callback) {
 
  var selfProfile = oPool.userList[socket.id];
  var friendProfile = oPool.profiles[options.id];
  
  if(selfProfile.getID() == options.id) {
    return callback(constants.errors.SELF_ILLEGAL);
  }
  
  var lock = String(selfProfile.getID() + "_" + options.id);
  
  if(oPool.likeLocks[lock]) {
    return callback(null, null); // Если таймаут еще не истек, ничего не начисляем
  }
  
  if(friendProfile) {
    friendProfile.addPoints(1, onPoints(friendProfile));
  } else {
    friendProfile = new ProfileJS();
    friendProfile.build(options.id, function (err, info) {
      if(err) { return callback(err);  }
      
      friendProfile.addPoints(1, onPoints(friendProfile));
    });
  }
  
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, res) {
      if(err) { return callback(err); }
      
      var socket = player.getSocket();
      socket.emit(constants.IO_ADD_POINTS, { points : res });
      
      oPool.likeLocks[lock] = true;
      
      setLikeTimeout(oPool.likeLocks, selfProfile.getID(), constants.TIMEOUT_LIKE);
      
      callback(null, null);
    }
  }
  
  function setLikeTimeout(locks, selfid, friendid, delay) {
    setTimeout(function () {
      var lock = String(selfid + "_" + friendid);
      delete locks[lock];
    }, delay);
  }
};