
/**
 * Добавляем лайк к профилю пользователя, добавляем ему очки
 *
 * @param socket, options - объект с ид пользователя, callback
 *
 */

const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');
const ProfileJS = require('./../../../profile/index');

const checkID   = require('./../../../check_id');
const emitRes   = require('./../../../emit_result');
const sanitize  = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const LIKE_TIMEOUT = Config.user.settings.like_timeout;
  const LIKE_BONUS  = Config.points.fixed.like_profile;
  const IO_LIKE_PROFILE = Config.io.emits.IO_LIKE_PROFILE;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_LIKE_PROFILE);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
 
  let selfProfile   = oPool.userList[socket.id];
  selfProfile.setActivity();
  
  let friendProfile = oPool.profiles[options[PF.ID]];
  
  if(selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_LIKE_PROFILE);
  }
  
  // Получаем замок и проверяем, не заблокирована ли возможнасть ставить лайк
  let lock = String(selfProfile.getID() + "_" + options[PF.ID]);
  
  // Если таймаут еще не истек, ничего не начисляем
  if(oPool.likeLocks[lock]) {
    return emitRes(null, socket, IO_LIKE_PROFILE);
  }
  
  // Добавляе мочки
  if(friendProfile) {
    friendProfile.addPoints(LIKE_BONUS, onPoints(friendProfile));
  } else {
    friendProfile = new ProfileJS();
    friendProfile.build(options[PF.ID], (err) => {
      if(err) {
        return emitRes(err, socket, IO_LIKE_PROFILE);
      }
      
      friendProfile.addPoints(LIKE_BONUS, onPoints(friendProfile));
    });
  }
  
  //-----------------------------------------------
  // Функция обрабатывает результы начисления очков, оповещает игрока
  function onPoints(player) {
    return function(err, points) {
      if(err) {
        return emitRes(err, socket, IO_LIKE_PROFILE);
      }
      
      oPool.likeLocks[lock] = true;
      
      setLikeTimeout(oPool.likeLocks, selfProfile.getID(), LIKE_TIMEOUT);
  
      emitRes(null, socket, IO_LIKE_PROFILE);
    }
  }
  
  // Функция блокирует добавление лайков от этого пользователя на заданный период времени
  function setLikeTimeout(locks, selfid, friendid, delay) {
    setTimeout(() => {
      
      let lock = String(selfid + "_" + friendid);
      delete locks[lock];
      
    }, delay);
  }
};