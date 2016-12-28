/**
 * Выполняем инициализацию профиля
 *
 * @param socket, options, callback
 * @return {Object} - объект со сведениями о пользователе, комнате, игре
 */
var async = require('async');

var oPool                 = require('./../../../objects_pool'),
    ProfileJS             = require('./../../../profile/index'),
    addProfileToPool      = require('./../common/add_profile_to_pool'),
    autoPlace             = require('./../common/auto_place_in_room'),
    // startTrack            = require('./../player/start_track'),
    sendUsersInRoom       = require('./../common/send_users_in_room'),
    addEmits              = require('../emits/add_emits'),
 Config = require('./../../../../config.json'),
  constants = require('./../../../constants'),
    PF                    = require('./../../../constants').PFIELDS;

var addProfileHandlers    = require('./../profile/add_pofile_hanlers');



module.exports = function (socket, options, callback) {
  async.waterfall([ //---------------------------------------------------------------
    function(cb) { // Сохраняем в сессию признак пройденной авторизации
      
      socket.handshake.session.authorized = true;
      socket.handshake.sessionStore.set(socket.handshake.sessionID, socket.handshake.session, function(err) {
        if(err) {cb (err, null); }
        
        cb(null, null);
      })
    }, //------------------------------------------------------------
    function (res, cb) { // Инициализируем профиль пользователя
      
      var selfProfile = new ProfileJS();
      addProfileHandlers(selfProfile);
        
      selfProfile.init(socket, options, function (err, info) {
        if (err) { return cb(err, null); }
        
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
  
        // Получаем состояние игры в комнате
        var game = room.getGame();
        if(game) {
          info[PF.GAME] = game.getGameState();
        }
        
        socket.join(room.getName());
  
        // startTrack(socket, room);
        
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
        cb(null, info, room, roomInfo, selfProfile);
      }
    },//------------------------------------------------------------
    function(info, room, roomInfo, selfProfile, cb) { // Временно - устанавливаем уровень
      var levelStart = Number(Config.levels.start);
      var levelStep  = Number(Config.levels.step);
      
      var currLevel = selfProfile.getLevel();
      var levelPoints = calcNeedPoints(currLevel, levelStart, levelStep);
      
      var currPoints = selfProfile.getPoints();
      
      if(currPoints > levelPoints) {
        var needLevel = currLevel;
        var p = levelPoints;
        
        while (currPoints > p) {
          p += calcNeedPoints(needLevel, levelStart, levelStep);
          needLevel++;
        }
        
        selfProfile.setLevel(needLevel-1, function (err, level) {
          if(err) { return cb(err); }
          
          cb(null, info, room, roomInfo, selfProfile);
        })
      } else {
        cb(null, info, room, roomInfo, selfProfile);
      }
    },//------------------------------------------------------------
    function(info, room, roomInfo, selfProfile, cb) { // Получаем данные по уровню игрока
            
      var levelStart = Number(Config.levels.start);
      var levelStep  = Number(Config.levels.step);
      var levelBonuses = Config.levels.bonuses;
      
      var currLevel = selfProfile.getLevel();
      var needPoints = calcNeedPoints(currLevel+1, levelStart, levelStep);
      var isPoints = calcNeedPoints(currLevel, levelStart, levelStep);
      var progress = Math.floor((selfProfile.getPoints() - isPoints ) / (needPoints - isPoints) * 100) ;
  
      var key = (currLevel + 1).toString();
      var bonuses = levelBonuses[key] || {};
  
      var newVIP = (bonuses.vip && !selfProfile.isVIP());
  
      var res = {};
      res[PF.LEVEL]             = currLevel;
      res[PF.ALL_POINTS]        = selfProfile.getPoints();
      res[PF.NEW_LEVEL_POINTS]  = needPoints;
      res[PF.CURR_LEVEL_POINTS] = isPoints;
      res[PF.PROGRESS]          = progress;
      res[PF.FREE_GIFTS]        = bonuses.gifts || 0;
      res[PF.FREE_TRACKS]       = bonuses.music || 0;
      res[PF.MONEY]             = bonuses.coins || 0;
      res[PF.VIP]               = newVIP || false;
  
      info[PF.LEVEL] = res;
      
      cb(null, info, room, roomInfo);
    },//------------------------------------------------------------
    function(info, room, roomInfo, cb) { // Отравляем в комнату сведения о пользователях в ней
    
      sendUsersInRoom(roomInfo, info[PF.ID], function(err, roomInfo) {
        if(err) { return cb(err); }
      
        info[PF.ROOM] = roomInfo;
      
        cb(null, info, room);
      });
    },//------------------------------------------------------------
    function(info, room, cb) {
  
      // Запускаем игру
      var game = room.getGame();
      game.addEmits(socket);
      game.start(socket);
      
      addEmits(socket);
            
      cb(null, info);
    } //------------------------------------------------------------
  ], function (err, info) { // Обрабатываем ошибки, либо передаем данные клиенту
    callback(err, info);
  });
  
  
  function calcNeedPoints(nl, start, step) {
    var np = 0;
    var prev = 0;
    for (var i = 0; i < nl; i++) {
      if(i == 0) {
        np = start;
        prev += start;
      } else {
        np = np + prev + step;
        prev += step;
      }
    }
    
    return np;
  }
};