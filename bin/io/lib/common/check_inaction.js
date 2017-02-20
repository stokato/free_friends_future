/**
 * Created by s.t.o.k.a.t.o on 16.02.2017.
 *
 * Проверяем, активен ли пользователь, если ничего не делает более заданного периода - разрываем соединение
 */

const Config = require('./../../../../config.json');
const oPool = require('./../../../objects_pool');

const disconnect = require('./../common/disconnect');

module.exports = function (socket) {
  
  const INACTION_TIMEOUT = Config.user.settings.user_inaction_timeout;
  const CHECK_INACTION_TIMEOUT = Config.user.settings.user_check_inaction_timeout;
  const EXIT_TIMEOUT  = Number(Config.io.exit_timeout);
  
  let profile = oPool.userList[socket.id];
  
  if(!profile) {
    console.log('Проверка активности, профиль не обнаружен');
    return;
  }
  
  profile.clearInactionTimer();
  
  setTimeout(checkInaction, CHECK_INACTION_TIMEOUT);
  
  // --------------------
  function checkInaction() {
    profile.clearInactionTimer();
    
    // console.log('start inaction ' + profile.getID());
    
    let connectionLost = profile.isConnectionLost();
    
    if(connectionLost) {
      profile.setConnectionLost(false);
      
      let oldDate = new Date(1);
      profile.setActivity(oldDate);
  
      // console.log(1 + ' ' + profile.getID() + (new Date()));
      return profile.setInactionTimer(setTimeout(checkInaction, EXIT_TIMEOUT));
    }
    
    let lastActivity = profile.getActivity();
    let date = new Date();
    
    let delta = date - lastActivity;
    
    if(delta < INACTION_TIMEOUT) {
      profile.setInactionTimer(setTimeout(checkInaction, CHECK_INACTION_TIMEOUT));
      // console.log(2 + ' ' + profile.getID() + (new Date()));
    } else {
      // let socket = profile.getSocket();
      
      if(socket) {
        // console.log(3 + ' ' + profile.getID() + (new Date()));
        socket.emit('inaction');
        
        disconnect(socket);
      }
    }
  }
  
};
