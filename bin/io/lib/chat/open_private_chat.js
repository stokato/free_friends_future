/**
 * Открываем чат с пользователем, отправляем открывшему историю сообщений
 *
 * @param socket, options - объект с ид пользователя, с которым чат, callback
 *
 */

const async             = require('async');

const Config            = require('./../../../../config.json');
const PF                = require('./../../../const_fields');
const oPool             = require('./../../../objects_pool');

const getUserProfile    = require('./../common/get_user_profile');
const genDateHistory    = require('./../common/gen_date_history');
const sendOne           = require('./../common/send_one');
const emitRes           = require('./../../../emit_result');
const checkID           = require('./../../../check_id');
const sanitize          = require('./../../../sanitize');



module.exports = function(socket, options, callback) {
  if(!checkID(options[PF.ID])) {
    if(callback) {
      return callback(Config.errors.NO_PARAMS);
    }
    return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_OPEN_PRIVATE_CHAT);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  async.waterfall([ //--------------------------------------------------
    function(cb) { // Получаем профиль пользователя, с которым открывается чат
      
      getUserProfile(options[PF.ID], cb);
      
    }, //---------------------------------------------------------------
    function(friendProfile, cb) { // Отрываем чат и отправляем историю
      let selfProfile = oPool.userList[socket.id];
      
      if(selfProfile.getID() == options[PF.ID]) {
        return cb(Config.errors.SELF_ILLEGAL);
      }
      
      let secondDate = new Date();
      let firstDate = genDateHistory(secondDate);
      
      selfProfile.addPrivateChat(friendProfile);
      
      selfProfile.getHistory(friendProfile.getID(), firstDate, secondDate, (err, history) => {
        history = history || [];
        
        if(err) {
          return cb(err, null);
        }
        
        let historyLen = history.length;
        for(let i = 0; i < historyLen; i++) {
          sendOne(socket, history[i]);
        }
        
        cb(null, null);
      });
    } //---------------------------------------------------------------
  ], function(err) { // Обрабатываем ошибки, если есть
    if (err) {
      if(callback) {
        return callback(err);
      }
      return emitRes(err, socket, Config.io.emits.IO_OPEN_PRIVATE_CHAT);
    }
    
    if(callback) {
      return callback(null, null);
    }
    emitRes(null, socket, Config.io.emits.IO_OPEN_PRIVATE_CHAT);
  });
  
};


