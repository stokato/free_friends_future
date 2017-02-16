/**
 * Created by s.t.o.k.a.t.o on 16.02.2017.
 *
 * Проверяем, активен ли пользователь, если ничего не делает более заданного периода - разрываем соединение
 */

const Config = require('./../../../../config.json');

const disconnect = require('./../common/disconnect');

module.exports = function (profile) {
  
  const INACTION_TIMEOUT = Config.user.settings.user_inaction_timeout;
  const CHECK_INACTION_TIMEOUT = Config.user.settings.user_check_inaction_timeout;
  
  profile.clearInactionTimer();
  
  setTimeout(checkInaction, CHECK_INACTION_TIMEOUT);
  
  // --------------------
  function checkInaction() {
    // profile.clearInactionTimer();
    
    let lastActivity = profile.getActivity();
    let date = new Date();
    
    let delta = date - lastActivity;
    
    if(delta < INACTION_TIMEOUT) {
      profile.setInactionTimer(setTimeout(checkInaction, CHECK_INACTION_TIMEOUT));
    } else {
      let socket = profile.getSocket();
      
      if(socket) {
        socket.emit('inaction');
        disconnect(socket);
      }
    }
    
    console.log(delta);
  }
  
};
