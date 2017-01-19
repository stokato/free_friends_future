/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Блокируем получение сообщений от пользователя
 */

const async = require('async');

const Config     = require('./../../../../config.json');
const oPool      = require('./../../../objects_pool');

const getUserProfile  = require('./../common/get_user_profile');
const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');
const IO_BLOCK_USER   = Config.io.emits.IO_BLOCK_USER;

const PF         = require('./../../../const_fields');

module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_BLOCK_USER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_BLOCK_USER);
  }
  
  let date = new Date();
  
  async.waterfall([//-----------------------------------------------------
      function (cb) { // Получаем профиль блокируемого пользователя
        
        getUserProfile(options[PF.ID], cb);
        
      },//-----------------------------------------------------
      function (friendProfile, cb) { // Добавляем в черный список
        
        selfProfile.addToBlackList(friendProfile, date, function (err) {
          if (err) { return cb(err, null); }
          
          cb(null, null);
        })
        
      }], //-----------------------------------------------------
    function (err) { // Проверяем на ошибки
      if (err) { return emitRes(err, socket, IO_BLOCK_USER); }
      
      emitRes(null, socket, IO_BLOCK_USER);
    }); // waterfall
  
};





