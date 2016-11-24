var async = require('async');

var oPool                 = require('./../../../objects_pool'),
    ProfileJS             = require('./../../../profile/index'),
    addProfileToPool      = require('./../common/add_profile_to_pool'),
    autoPlace             = require('./../common/auto_place_in_room'),
    startTrack            = require('./../player/start_track'),
    sendUsersInRoom       = require('./../common/send_users_in_room'),
    addEmits              = require('../emits/add_emits'),
    PF                    = require('./../../../constants').PFIELDS;

/*
 Выполняем инициализацию
 - Создаем профиль
 - Добавляем его в массив онлайн профилей
 - Помещаем в комнату
 - Получаем данные профиля (какие именно в этот момент нужны???)
 - Получаем данные профилей игроков в комнате (для игрового стола)
 - Отправляем все клиенту
 */

module.exports = function (socket, options, callback) {
  async.waterfall([
    
    function(cb) { // Сохраняем в сессию признак пройденной авторизации
      socket.handshake.session.authorized = true;
      socket.handshake.sessionStore.set(socket.handshake.sessionID, socket.handshake.session, function(err) {
        if(err) {cb (err, null); }
        
        cb(null, null);
      })
    }, //------------------------------------------------------------
    function (res, cb) { // Инициализируем профиль пользователя
      
      var selfProfile = new ProfileJS();
        
      selfProfile.init(socket, options, function (err) {
        if (err) { return cb(err, null); }
        
        var info = {};
        info[PF.ID]       = selfProfile.getID();
        info[PF.VID]      = selfProfile.getVID();
        info[PF.AGE]      = selfProfile.getAge();
        info[PF.SEX]      = selfProfile.getSex();
        info[PF.MONEY]    = selfProfile.getMoney();
        info[PF.POINTS]   = selfProfile.getPoints();
        info[PF.STATUS]   = selfProfile.getStatus();
        info[PF.CITY]     = selfProfile.getCity();
        info[PF.COUNTRY]  = selfProfile.getCountry();
        
        var isNewConnect = addProfileToPool(selfProfile, socket);
        
        cb(null, info, isNewConnect, selfProfile);
      });
    }, //------------------------------------------------------------
    function (info, newConnect, selfProfile, cb) { // Помещяем в комнату
      if(newConnect) {
        autoPlace(socket, function (err, room) {
          if (err) { return cb(err, null); }
          
          cb(null, info, room, selfProfile);
        });
      } else {
        var room = oPool.roomList[socket.id];
        info[PF.GAME] = room.getGame().getGameState(); // Получаем состояние игры в комнате
        socket.join(room.getName());
  
        startTrack(room, socket);
        
        cb(null, info, room, selfProfile);
      }
    },//------------------------------------------------------------
    function (info, room, selfProfile, cb) { // Получаем данные по игрокам в комнате (для стола)
  
      var roomInfo = room.getInfo();
  
      info[PF.ROOM] = roomInfo;
  
      if(info[PF.GIFT1]) {
        var currDate = new Date();
        var giftDate = new Date(info[PF.GIFT1][PF.DATE]);
        if(currDate >= giftDate) {
          selfProfile.clearGiftInfo(function() {
            info[PF.GIFT1] = null;
        
            cb(null, info, room, roomInfo);
          });
        } else {
          cb(null, info, room, roomInfo);
        }
      } else {
        cb(null, info, room, roomInfo);
      }
    },//------------------------------------------------------------
    function(info, room, roomInfo, cb) { // Отравляем в комнату сведения о пользователях в ней
      //socket.broadcast.in(room.name).emit(constants.IO_ROOM_USERS, roomInfo);
      sendUsersInRoom(roomInfo, info[PF.ID], function(err, roomInfo) {
        if(err) { return cb(err); }
        
        info[PF.ROOM] = roomInfo;
        
        cb(null, info, room);
      });
    },//------------------------------------------------------------
    function(info, room, cb) {
  
      // Запускаем игру
      room.getGame().start(socket);
      
      addEmits(socket);
      
      cb(null, info);
    } //------------------------------------------------------------
  ], function (err, info) { // Обрабатываем ошибки, либо передаем данные клиенту
    callback(err, info);
  });
};