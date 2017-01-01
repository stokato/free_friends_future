/**
 * Получаем историю сообщений по приватному чату
 *
 * @param socket, options - обект с ид пользователя, чат с которым нужно поулучить и временной период
 */

const async             = require('async');
const validator         = require('validator');

const constants         = require('./../../../constants');
const oPool             = require('./../../../objects_pool');

const  getUserProfile   = require('./../common/get_user_profile');
const  sendOne          = require('./../common/send_one');
const emitRes           = require('./../../../emit_result');
const checkID           = require('./../../../check_id');
const sanitize          = require('./../../../sanitizer');

const PF = constants.PFIELDS;


module.exports = function(socket, options) {
  if(!checkID(options[PF.ID]) ||
      !validator.isDate(options[PF.DATE_FROM] + "") ||
      !validator.isDate(options[PF.DATE_TO] + "")) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GET_CHAT_HISTORY);
  }
  
  options[constants.PFIELDS.ID] = sanitize(options[constants.PFIELDS.ID]);
  
  
  async.waterfall([ //-----------------------------------------------------
    function(cb) { // Получаем профиль
      
      getUserProfile(options[constants.PFIELDS.ID], cb);
      
    }, //------------------------------------------------------------------
    function(friendProfile, cb) { // Получаем историю и отправляем отдельными сообщениями
      let selfProfile = oPool.userList[socket.id];
      
      if(selfProfile.getID() == options[constants.PFIELDS.ID]) {
        return cb(constants.errors.SELF_ILLEGAL);
      }
      
      if(selfProfile.isPrivateChat(friendProfile.getID())) {
        
        let id        = options[constants.PFIELDS.ID],
            dateFrom  = options[constants.PFIELDS.DATE_FROM],
            dateTo    = options[constants.PFIELDS.DATE_TO];
        
        selfProfile.getHistory(id, dateFrom, dateTo, function(err, history) {
          if(err) { return cb(err, null); }
          
          history = history || [];
          
          for(let i = 0; i < history.length; i++) {
            sendOne(socket, history[i]);
          }
        });
        cb(null, null);
      } else {
        return cb(new Error(constants.errors.NO_SUCH_CHAT));
      }
    } //------------------------------------------------------------------------
  ], function(err, res) {
    if (err) { return  emitRes(err, socket, constants.IO_GET_CHAT_HISTORY); }
    
    emitRes(null, socket, constants.IO_GET_CHAT_HISTORY, null);
  });
  
};

