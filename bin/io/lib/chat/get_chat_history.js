/**
 * Получаем историю сообщений по приватному чату
 *
 * @param socket,
 * @param options - обект с ид пользователя, чат с которым нужно поулучить и временной период
 */

const async             = require('async');
const validator         = require('validator');

const Config            = require('./../../../../config.json');
const PF                = require('./../../../const_fields');
const oPool             = require('./../../../objects_pool');

const getUserProfile    = require('./../common/get_user_profile');
const sendOne           = require('./../common/send_one');
const emitRes           = require('./../../../emit_result');
const checkID           = require('./../../../check_id');
const sanitize          = require('./../../../sanitize');

module.exports = function(socket, options) {
  
  const IO_GET_CHAT_HISTORY = Config.io.emits.IO_GET_CHAT_HISTORY;
  
  if(!checkID(options[PF.ID]) ||
      !validator.isDate(options[PF.DATE_FROM] + "") ||
      !validator.isDate(options[PF.DATE_TO] + "")) {
    return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GET_CHAT_HISTORY);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  selfProfile.setActivity();
  
  async.waterfall([ //-----------------------------------------------------
    function(cb) { // Получаем профиль
      
      getUserProfile(options[PF.ID], cb);
      
    }, //------------------------------------------------------------------
    function(friendProfile, cb) { // Получаем историю и отправляем отдельными сообщениями
      
      
      if(selfProfile.getID() == options[PF.ID]) {
        return cb(Config.errors.SELF_ILLEGAL);
      }
      
      if(selfProfile.isPrivateChat(friendProfile.getID())) {
        
        let id        = options[PF.ID];
        let dateFrom  = options[PF.DATE_FROM];
        let dateTo    = options[PF.DATE_TO];
        
        selfProfile.getHistory(id, dateFrom, dateTo, (err, history) => {
          if(err) {
            return cb(err, null);
          }
          
          history = history || [];
          
          for(let i = 0; i < history.length; i++) {
            sendOne(socket, history[i]);
          }
        });
        cb(null, null);
      } else {
        return cb(new Error(Config.errors.NO_SUCH_CHAT));
      }
    } //------------------------------------------------------------------------
  ], function(err, res) {
    if (err) {
      return  emitRes(err, socket,IO_GET_CHAT_HISTORY);
    }
    
    emitRes(null, socket, IO_GET_CHAT_HISTORY, null);
  });
  
};

