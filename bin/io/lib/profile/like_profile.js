/**
 * Добавляем лайк к профилю пользователя, добавляем ему очки
 *
 * @param socket, options - объект с ид пользователя, callback
 *
 */

const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');
const oPool     = require('./../../../objects_pool');
const ProfileJS = require('./../../../profile/index');

const checkID   = require('./../../../check_id');
const emitRes   = require('./../../../emit_result');
const sanitize  = require('./../../../sanitize');

const PF           = constants.PFIELDS;
const LIKE_TIMEOUT = Config.user.settings.like_timeout;

module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_LIKE_PROFILE);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
 
  let selfProfile = oPool.userList[socket.id];
  let friendProfile = oPool.profiles[options[PF.ID]];
  
  if(selfProfile.getID() == options[PF.ID]) {
    return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_LIKE_PROFILE);
  }
  
  // Получаем замок и проверяем, не заблокирована ли возможнасть ставить лайк
  let lock = String(selfProfile.getID() + "_" + options[PF.ID]);
  
  // Если таймаут еще не истек, ничего не начисляем
  if(oPool.likeLocks[lock]) {
    return emitRes(null, socket, constants.IO_LIKE_PROFILE);
  }
  
  // Добавляе мочки
  if(friendProfile) {
    friendProfile.addPoints(constants.LIKE_BONUS_POINTS, onPoints(friendProfile));
  } else {
    friendProfile = new ProfileJS();
    friendProfile.build(options[PF.ID], function (err) {
      if(err) { return emitRes(err, socket, constants.IO_LIKE_PROFILE); }
      
      friendProfile.addPoints(constants.LIKE_BONUS_POINTS, onPoints(friendProfile));
    });
  }
  
  //-----------------------------------------------
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, points) {
      if(err) { return emitRes(err, socket, constants.IO_LIKE_PROFILE); }
      
      oPool.likeLocks[lock] = true;
      
      setLikeTimeout(oPool.likeLocks, selfProfile.getID(), LIKE_TIMEOUT);
  
      emitRes(null, socket, constants.IO_LIKE_PROFILE);
    }
  }
  
  // Функция блокирует добавление лайков от этого пользователя на заданный период времени
  function setLikeTimeout(locks, selfid, friendid, delay) {
    setTimeout(function () {
      let lock = String(selfid + "_" + friendid);
      delete locks[lock];
    }, delay);
  }
};