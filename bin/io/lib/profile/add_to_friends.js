/**
 * Добавляем пользователя в друзья
 *
 * @param socket, options - объект с ид нового друга, callback
 * @return {Object} - сведения о новом друге
 */

const async =  require('async');

const Config          = require('./../../../../config.json');
const  PF             = require('./../../../const_fields');
const oPool           = require('./../../../objects_pool');

const getUserProfile  = require('./../common/get_user_profile');
const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_ADD_FRIEND   = Config.io.emits.IO_ADD_FRIEND;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_ADD_FRIEND);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_ADD_FRIEND);
  }
  
  let date = new Date();
  
  async.waterfall([//-----------------------------------------------------
      function (cb) { // Получаем профиль друга
        
        getUserProfile(options[PF.ID], cb);
        
      },//-----------------------------------------------------
      function (friendProfile, cb) { // Добавляем первому друго
        
        selfProfile.addToFriends(friendProfile, date, (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, selfProfile, friendProfile, date);
        })
        
      },//-----------------------------------------------------
      function (selfProfile, friendProfile, date, cb) { // И второму
        
        friendProfile.addToFriends(selfProfile, date, (err) => {
          if (err) {
            return cb(err, null);
          }
          
          cb(null, friendProfile, selfProfile, date);
        })
        
      }], //-----------------------------------------------------
    function (err, friendProfile) { // Отправляем сведения о новом друге
      if (err) {
        return emitRes(err, socket, IO_ADD_FRIEND);
      }

      let friendInfoObj = fillInfo(friendProfile, date);
      
      if (oPool.isProfile(friendProfile.getID())) { // Если друг онлайн, то и ему
        let selfInfoObj = fillInfo(selfProfile, date);
        
        let friendSocket = friendProfile.getSocket();
        friendSocket.emit(Config.io.emits.IO_NEW_FRIEND, selfInfoObj);

        let selfRoom = oPool.roomList[socket.id];
        let friendRoom = oPool.roomList[friendSocket.id];
        if(selfRoom.getName() == friendRoom.getName()) {
          selfRoom.setFriendInfo(selfProfile.getID(), friendProfile.getID(), true);
        }
      }
      
      emitRes(null, socket, IO_ADD_FRIEND, friendInfoObj);
    }); // waterfall
  
  //--------------
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




