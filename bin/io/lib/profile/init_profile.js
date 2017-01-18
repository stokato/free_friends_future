/**
 * Выполняем инициализацию профиля
 *
 * @param socket, options, callback
 * @return {Object} - объект со сведениями о пользователе, комнате, игре
 */

const async     = require('async');
const validator = require('validator');

const Config    = require('./../../../../config.json');
const constants = require('./../../../constants');
const oPool     = require('./../../../objects_pool');
const ProfileJS = require('./../../../profile/index');

const addProfileToPool    = require('./../common/add_profile_to_pool');
const autoPlace           = require('./../common/auto_place_in_room');
// const sendUsersInRoom     = require('./../common/get_users_in_room');
const addEmits            = require('../common/add_emits');
const emitAllRooms        = require('../common/emit_all_rooms');
const sendPrivateChats    = require('../common/send_private_chats');
const addProfileHandlers  = require('./../handlers/add_pofile_hanlers');
const emitRes             = require('./../../../emit_result');
const calcNeedPoints      = require('./../common/calc_need_points');


const GUY = Config.user.constants.sex.male;
const GIRL = Config.user.constants.sex.female;
const PF                  = constants.PFIELDS;

module.exports = function (socket, options) {
  if(!validator.isInt(options[PF.COUNTRY] + "") ||
      !validator.isInt(options[PF.CITY] + "") ||
      !validator.isDate(options[PF.BDATE] + "") ||
      !(options[PF.SEX] + "" == GUY || options[PF.SEX] + "" == GIRL)) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_INIT);
  }
  
  async.waterfall([ //---------------------------------------------------------------
    function(cb) { // Сохраняем в сессию признак пройденной авторизации
      
      socket.handshake.session.authorized = true;
      socket.handshake.sessionStore.set(socket.handshake.sessionID, socket.handshake.session, function(err) {
        if(err) {cb (err, null); }
        
        cb(null, null);
      })
    }, //------------------------------------------------------------
    function (res, cb) { // Инициализируем профиль пользователя
      
      let selfProfile = new ProfileJS();
      addProfileHandlers(selfProfile);
        
      selfProfile.init(socket, options, function (err, info) {
        if (err) { return cb(err, null); }
        
        let isNewConnect = addProfileToPool(selfProfile, socket);
        
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
        let room = oPool.roomList[socket.id];
  
        // Получаем состояние игры в комнате
        let game = room.getGame();
        if(game) {
          info[PF.GAME] = game.getGameState();
        }
        
        socket.join(room.getName());
        
        room.getMusicPlayer().addEmits(socket);
        room.getRanks().addEmits(socket);
        
        cb(null, info, room, selfProfile);
      }
    },//------------------------------------------------------------
    function (info, room, selfProfile, cb) { // Получаем данные по игрокам в комнате (для стола)
  
      info[PF.ROOM] = room.getPersonalInfo(selfProfile.getID());
  
      // if(info[PF.GIFT1]) {
      //   let currDate = new Date();
      //   let giftDate = new Date(info[PF.GIFT1][PF.DATE]);
      //   if(currDate >= giftDate) {
      //     selfProfile.clearGiftInfo(function() {
      //       info[PF.GIFT1] = null;
      //
      //       cb(null, info, room);
      //     });
      //   } else {
      //     cb(null, info, room);
      //   }
      // } else {
        cb(null, info, room, selfProfile);
      // }
    },//------------------------------------------------------------
    function(info, room, selfProfile, cb) { // Временно - устанавливаем уровень TODO: убрать
      let levelStart = Number(Config.levels.start);
      let levelStep  = Number(Config.levels.step);
  
      let currLevel = selfProfile.getLevel();
      let levelPoints = calcNeedPoints(currLevel, levelStart, levelStep);
  
      let currPoints = selfProfile.getPoints();
  
      if(currPoints > levelPoints) {
        let needLevel = currLevel + 1;
        let p = 0;
    
        while (currPoints > p) {
          p = calcNeedPoints(needLevel, levelStart, levelStep);
          needLevel++;
        }
    
        selfProfile.setLevel(needLevel-2, function (err, level) {
          if(err) { return cb(err); }
      
          cb(null, info, room, selfProfile);
        })
      } else {
        cb(null, info, room, selfProfile);
      }
    },//------------------------------------------------------------
    function(info, room, selfProfile, cb) { // Получаем данные по уровню игрока
            
      let levelStart    = Number(Config.levels.start);
      let levelStep     = Number(Config.levels.step);
      let levelBonuses  = Config.levels.bonuses;
      
      let currLevel = selfProfile.getLevel();
      let nextLP    = calcNeedPoints(currLevel+1, levelStart, levelStep);
      let currLP    = calcNeedPoints(currLevel, levelStart, levelStep);
      let progress  = Math.floor((selfProfile.getPoints() - currLP ) / (nextLP - currLP) * 100) ;
  
      let key     = (currLevel + 1).toString();
      let bonuses = levelBonuses[key] || {};
  
      let newVIP = (bonuses.vip && !selfProfile.isVIP());
  
      info[PF.LEVEL] = {
        [PF.LEVEL]             : currLevel,
        [PF.ALL_POINTS]        : selfProfile.getPoints(),
        [PF.NEW_LEVEL_POINTS]  : nextLP,
        [PF.CURR_LEVEL_POINTS] : currLP,
        [PF.PROGRESS]          : progress,
        [PF.FREE_GIFTS]        : bonuses.gifts || 0,
        [PF.FREE_TRACKS]       : bonuses.music || 0,
        [PF.MONEY]             : bonuses.coins || 0,
        [PF.VIP]               : newVIP || false
      };
      
      cb(null, info, room);
    },//------------------------------------------------------------
    function(info, room, cb) {
  
      emitRes(null, socket, constants.IO_INIT, info);
  
      // Запускаем игру
      let game = room.getGame();
      game.addEmits(socket);
      game.start(socket);
      
      addEmits(socket);
            
      cb(null, info);
    } //------------------------------------------------------------
  ], function (err, info) { // Обрабатываем ошибки, либо передаем данные клиенту
    if(err) { emitRes(err, socket, constants.IO_INIT); }
  
  
    let params = {
      [PF.ID]   : info[PF.ID],
      [PF.VID]  : info[PF.VID]
    };
  
    // Уведомляем всех о том, что пользователь онлайн
    emitAllRooms(socket, constants.IO_ONLINE, params);
  
    // Отправляем пользовелю последние сообщеиня из общего чата
    //getLastMessages(socket, oPool.rooms[info[PF.ROOM][PF.ROOMNAME]]);
  
    // Отправляем пользователю открытные приватные чаты (если он обновляет страницу)
    sendPrivateChats(socket);
  
    // Запускаем трек
    let room = oPool.roomList[socket.id];
    room.getMusicPlayer().startTrack(socket, room);
    room.getRanks().emitAddBall(info[PF.ID]);
  });
  
};