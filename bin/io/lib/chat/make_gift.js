/**
 *  Делаем подарок пользователю
 *
 *  @param socket, options - объект и ид пользователя, которому дарим и ид подарка, callback
 */

const async      =  require('async');

const Config          = require('./../../../../config.json');
const PF              = require('./../../../const_fields');
const dbCtrlr         = require('./../../../db_controller');
const oPool           = require('./../../../objects_pool');
const statCtrlr       = require('./../../../stat_controller');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');
const getUserProfile  = require('./../common/get_user_profile');

module.exports = function (socket, options) {
  
  //TODO: установить ограничение на options[PF.PARAMS] - длина массива
  
  const WASTE_POINTS = Number(Config.points.waste);
  const GIFT_POINTS = Number(Config.points.taken_gift);
  const GIFT_TYPE = Config.good_types.gift;
  const GENEROUS_RANK = Config.ranks.generous.name;
  const POPULAR_RANK = Config.ranks.popular.name;
  const GIFT_GROUPS = Config.gifts.groups;
  const IO_MAKE_GIFT = Config.io.emits.IO_MAKE_GIFT;
  const IO_NEW_GIFT = Config.io.emits.IO_NEW_GIFT;
  const GUY        = Config.user.constants.sex.male;
  const GIRL       = Config.user.constants.sex.female;
  
  if (!checkID(options[PF.GIFTID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
  }
  
  let selfProfile = oPool.userList[socket.id];
  
  selfProfile.setActivity();
  
  if(!options[PF.DESTINATION]) {
    if (!checkID(options[PF.ID])) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
    }
    
    options[PF.ID] = sanitize(options[PF.ID]);
    
    if (selfProfile.getID() == options[PF.ID]) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_MAKE_GIFT);
    }
  } else {
    if(options[PF.DESTINATION] != GIRL && options[PF.DESTINATION] != GUY) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
    }
  }
  
  options[PF.GIFTID] = sanitize(options[PF.GIFTID]);
  
  async.waterfall([//---------------------------------------------------------------
    function (cb) { // Ищем подарок в магазине // 1
      dbCtrlr.findGood(options[PF.GIFTID], (err, giftObj) => {
        if (err) {
          return cb(err, null)
        }
        
        if(giftObj[PF.LEVEL] && giftObj[PF.LEVEL] > selfProfile.getLevel()) {
          cb(Config.errors.TOO_LITTLE_LEVEL);
        }
        
        if (giftObj) {
          if (giftObj[PF.GOODTYPE] != GIFT_TYPE) {
            cb(Config.errors.NO_SUCH_GOOD, null);
          } else {
            if(giftObj[PF.RANK]) {
              let ranksCtrlr = oPool.roomList[socket.id].getRanks();
              if(ranksCtrlr.getRankOwner(giftObj[PF.RANK]) == selfProfile.getID()) {
                cb(null, giftObj);
              } else {
                cb(Config.errors.NO_SUCH_RUNK, null);
              }
            } else {
              cb(null, giftObj);
            }
          }
        } else {
          cb(Config.errors.NO_SUCH_GOOD, null);
        }
      });
    }, //---------------------------------------------------------------
    function (giftObj, cb) {
      if(!options[PF.DESTINATION]) {
        
        getUserProfile(options[PF.ID], (err, profile) => {
          if (err) {
            return cb(err, null);
          }
          
          if(!profile) {
            return cb(Config.errors.NO_THAT_PLAYER, null);
          }
          
          cb(null, giftObj, [profile]);
        });
        
      } else {
        let room = oPool.roomList[socket.id];
        let profiles = room.getAllPlayers(options[PF.DESTINATION]);
        let players = [];
        
        for(let i = 0; i < profiles.length; i++) {
          if(profiles[i].getID() != selfProfile.getID()) {
            players.push(profiles[i]);
          }
        }
        
        cb(null, giftObj, players);
      }
    },//---------------------------------------------------------------
    function (giftObj, profiles, cb) { // Снимаем деньги с пользователя и уведомляем его об этом // 1
    
      let countGifts = Number(options[PF.COUNT] || 1);
      let countPlayers = profiles.length;
      let price = giftObj[PF.PRICE] * countGifts * countPlayers;
    
      selfProfile.pay(price, (err, money) => {
        if (err) {
          return cb(err, null);
        }
      
        // Статистика
        statCtrlr.setUserStat(selfProfile.getID(), selfProfile.getVID(), PF.GIFTS_GIVEN, 1);
      
        cb(null, giftObj, profiles, price);
      });
    },//---------------------------------------------------------------
    function (giftObj, profiles, price, cb) { // 1
      let points = Math.round(WASTE_POINTS * price);
    
      selfProfile.addPoints(points, (err, points) => {
        if (err) {
          return cb(err, null);
        }
      
        let ranksCtrlr = oPool.roomList[socket.id].getRanks();
        let balls = (options[PF.COUNT] || 1) * profiles.length;
        ranksCtrlr.addRankBall(GENEROUS_RANK, selfProfile.getID(), balls);
      
        cb(null, giftObj, profiles);
      });
    },//---------------------------------------------------------------
    function (giftObj, profiles, cb) {
      
      let counter = 0;
      
      makeGift (profiles[counter], giftObj, onComplete);
      
      function onComplete(err) {
        if(err) {
          return cb(err);
        }
        
        counter++;
        
        if(counter < profiles.length) {
          makeGift(profiles[counter], giftObj, onComplete);
        } else {
          cb(null, null);
        }
      }
      
    }
  ], function (err) { // Вызывается последней. Рассылаем уведомления о подарке // 1
    if (err) {
      return emitRes(err, socket, IO_MAKE_GIFT);
    }
    
    emitRes(null, socket, IO_MAKE_GIFT);
    
  }); // waterfall
  
  
  // --------------------------------------------------------
  function makeGift (friendProfile, giftObj, onComplete) {
    
    let date = new Date();
    
    async.waterfall([//---------------------------------------------------------------
      function (cb) { // Получаем профиль адресата // 8
        // if(profile) {
        //Статистика
        let group = giftObj[PF.GROUP];
        if(GIFT_GROUPS[group]) {
          statCtrlr.setMainStat(GIFT_GROUPS[group].stat, 1);
        }
        
        cb(null, null);
      }, //---------------------------------------------------------------
      function (res, cb) { // Добавляем подарок адресату // 8
        
        friendProfile.addGift(selfProfile, date, giftObj, options[PF.COUNT], options[PF.PARAMS], (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          // Статистика
          statCtrlr.setUserStat(friendProfile.getID(), friendProfile.getVID(), PF.GIFTS_TAKEN, 1);
          
          cb(null, null);
        });
      }, //---------------------------------------------------------------
      function (res, cb) { // 8
        let points = Math.round(GIFT_POINTS * giftObj[PF.PRICE] * (options[PF.COUNT] || 1));
        
        friendProfile.addPoints(points, (err, points) => {
          if (err) {
            return cb(err, null);
          }
          
          let selfRoom = oPool.roomList[socket.id];
          
          let friendSocket = friendProfile.getSocket();
          if (friendSocket) {
            let friendRoom = oPool.roomList[friendSocket.id];
            
            if (selfRoom.getName() == friendRoom.getName()) {
              let ranksCtrlr = oPool.roomList[friendSocket.id].getRanks();
              ranksCtrlr.addRankBall(POPULAR_RANK, friendProfile.getID());
            }
          }
          
          cb(null, giftObj[PF.TYPE]);
        });
        
      } //---------------------------------------------------------------
    ], function (err, gtype) { // Вызывается последней. Рассылаем уведомления о подарке // 1
      if (err) {
        return onComplete(err);
      }
      
      let giftObj = friendProfile.getGiftByType(gtype);
      
      if (!giftObj) {
        return onComplete(Config.errors.OTHER);
      }
      
      let resObj = {
        [PF.FID]        : selfProfile.getID(),
        [PF.FVID]       : selfProfile.getVID(),
        [PF.ID]         : friendProfile.getID(),
        [PF.VID]        : friendProfile.getVID(),
        [PF.GIFTID]     : giftObj[PF.ID],
        [PF.SRC]        : giftObj[PF.SRC],
        [PF.TYPE]       : giftObj[PF.TYPE],
        [PF.GROUP]      : giftObj[PF.GROUP],
        [PF.TITLE]      : giftObj[PF.TITLE],
        [PF.DATE]       : giftObj[PF.DATE],
        [PF.UGIFTID]    : giftObj[PF.UGIFTID],
        [PF.ISPRIVATE]  : options[PF.ISPRIVATE],
        [PF.PARAMS]     : giftObj[PF.PARAMS],
        [PF.COUNT]      : giftObj[PF.COUNT]
      };
      
      let room = oPool.roomList[socket.id];
      
      socket.emit(IO_NEW_GIFT, resObj);
      
      if (!options[PF.ISPRIVATE]) {
        
        socket.broadcast.in(room.getName()).emit(IO_NEW_GIFT, resObj);
        
      } else if (oPool.isProfile(friendProfile.getID())) {
        
        let friendSocket = friendProfile.getSocket();
        friendSocket.emit(IO_NEW_GIFT, resObj);
      }
      
      onComplete();
      
    }); // waterfall
  } // makeGift
};



