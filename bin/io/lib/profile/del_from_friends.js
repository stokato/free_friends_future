/**
 * Удаляем пользователя из друзей, отправляем сведения о бывшем друге
 *
 * @param socket, options - объект с ид бывешго друга, callback
 *
 */
const async     =  require('async');

const Config          = require('./../../../../config.json');
const PF              = require('./../../../const_fields');
const oPool           = require('./../../../objects_pool');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');
const getUserProfile  = require('./../common/get_user_profile');

module.exports = function (socket, options) {
  
  const IO_DEL_FROM_FRIENDS = Config.io.emits.IO_DEL_FROM_FRIENDS;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_DEL_FROM_FRIENDS);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_DEL_FROM_FRIENDS);
  }
  
  let date = new Date();
  
  async.waterfall([//--------------------------------------------------------
      function (cb) { // Получаем профиль друга
        
        getUserProfile(options[PF.ID], cb);
        
      },//--------------------------------------------------------
      function (friendProfile, cb) { // Удаляем первого из друзей
        
        friendProfile.delFromFriends(selfProfile.getID(), (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, friendProfile);
        })
        
      },//--------------------------------------------------------
      function (friendProfile, cb) { // Удаляем второго
        
        selfProfile.delFromFriends(friendProfile.getID(), (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, friendProfile);
        })
        
      }], //--------------------------------------------------------
    function (err, friendProfile) { // Отправляем сведения о бывшем друге
      if (err) {
        return emitRes(err, socket, IO_DEL_FROM_FRIENDS);
      }
      
      let friendInfo = fillInfo(friendProfile, date);
      
      if (oPool.profiles[friendProfile.getID()]) { // Если друг онлайн, то и ему
        let selfInfoObj = fillInfo(selfProfile, date);
        let friendSocket = friendProfile.getSocket();
        
        friendSocket.emit(Config.io.emits.IO_NO_FRIEND, selfInfoObj);
        
        let selfRoom = oPool.roomList[socket.id];
        let friendRoom = oPool.roomList[friendSocket.id];
        if(selfRoom.getName() == friendRoom.getName()) {
          selfRoom.setFriendInfo(selfProfile.getID(), friendProfile.getID(), false);
        }
      }
      
      emitRes(null, socket, IO_DEL_FROM_FRIENDS, friendInfo);
    }); // waterfall
  
  
  //-------------------------
  function fillInfo(profile, date) {
    
    return {
      [PF.ID]      : profile.getID(),
      [PF.VID]     : profile.getVID(),
      [PF.DATE]    : date,
      [PF.POINTS]  : profile.getPoints(),
      [PF.AGE]     : profile.getAge(),
      [PF.CITY]    : profile.getCity(),
      [PF.COUNTRY] : profile.getCountry(),
      [PF.SEX]     : profile.getSex()
    };
  }
  
};


