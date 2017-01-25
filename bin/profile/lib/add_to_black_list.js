/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Добавляем пользователя в черный список
 */

const  logger   = require('./../../../lib/log')(module);
const  Config   = require('./../../../config.json');
const  dbCtrlr  = require('./../../db_controller');
const  PF       = require('./../../const_fields');

module.exports = function (blockedProfile, date, callback) {
  
  const  BLOCK_TIMEOUT = Config.user.settings.user_block_timeout;
  
  let  self = this;
  
  let  blockedID = blockedProfile.getID();
  
  let  params = {
    [PF.ID]     : blockedID,
    [PF.VID]    : blockedProfile.getVID(),
    [PF.DATE]   : date
  };
  
  dbCtrlr.addBlocked(self._pID, params, (err) => {
    if (err) {
      return callback(err, null);
    }
    
    if(self._pBlackList[blockedID]) { // Если пользователь уже был ранее заблокирован, удалем таймер
      clearTimeout(self._pBlackList[blockedID].timeout);
    }
    
    self._pBlackList[blockedID] = {
      date : date,
      timeout : setBlockedTimeout(self, blockedID, BLOCK_TIMEOUT)
    };
    
    callback(null, blockedID);
  });
  
  //------------------------------------------------------
  function setBlockedTimeout(profile, blockedID, delay) {
  
    return setTimeout(() => {
      profile.delFromBlackList(blockedID, (err) => {
        if(err){
          logger.error("Ошибка при удалении пользователя из черного списка");
        }
      });
    }, delay);
    
  }
};