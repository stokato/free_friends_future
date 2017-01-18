/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Добавляем пользователя в черный список
 */

const  Config = require('./../../../config.json');
const  db     = require('./../../db_manager');
const  IOF    = require('./../../constants').PFIELDS;

const  BLOCK_TIMEOUT = Config.user.settings.user_block_timeout;

module.exports = function (blockedProfile, date, callback) {
  let  self = this;
  
  let  blockedID = blockedProfile.getID();
  
  let  params = {
    [IOF.ID]     : blockedID,
    [IOF.VID]    : blockedProfile.getVID(),
    [IOF.DATE]   : date
  };
  
  db.addBlocked(self._pID, params, function (err) {
    if (err) { return callback(err, null); }
    
    if(self._pBlackList[blockedID]) { // Если пользователь уже был ранее заблокирован, удалем таймер
      clearTimeout(self._pBlackList[blockedID].timeout);
    }
    
    self._pBlackList[blockedID] = {
      date : date,
      timeout : setBlockedTimeout(self, blockedID, BLOCK_TIMEOUT)
    };
    
    callback(null, blockedID);
  });
  
  
  function setBlockedTimeout(profile, blockedID, delay) {
    
    let  timeout = setTimeout(function () {
      profile.delFromBlackList(blockedID, function (err) {
        if(err){ console.log("Ошибка при удалении пользователя из черного списка");}
      })
    }, delay);
    
    return timeout;
  }
};