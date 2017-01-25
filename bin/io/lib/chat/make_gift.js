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
  
  options[PF.GIFTID] = sanitize(options[PF.GIFTID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if(!options[PF.DESTINATION]) {
    if (!checkID(options[PF.ID])) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
    }
  
    options[PF.ID] = sanitize(options[PF.ID]);
    
    if (selfProfile.getID() == options[PF.ID]) {
      return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_MAKE_GIFT);
    }
  
    getUserProfile(options[PF.ID], (err, profile) => {
      if (err) {
        emitRes(err, socket, IO_MAKE_GIFT);
      }
    
      if(!profile) {
        return emitRes(Config.errors.NO_THAT_PLAYER, socket, IO_MAKE_GIFT);
      }
      
      makeGift(profile);
    });
    
  } else {
    if(options[PF.DESTINATION] != GIRL && options[PF.DESTINATION] != GUY) {
      return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
    }
    
    let room = oPool.roomList[socket.id];
    let profiles = room.getAllPlayers(options[PF.DESTINATION]);
    
    profiles.forEach((profile, index, arr) => {
      if(profile.getID() != selfProfile.getID()) {
        makeGift(profile);
      }
    })
  }
  
  
  function makeGift (profile) {
    
    let date = new Date();
    
    async.waterfall([//---------------------------------------------------------------
      function (cb) { // Ищем подарок в магазине
        dbCtrlr.findGood(options[PF.GIFTID], (err, giftObj) => {
          if (err) {
            return cb(err, null)
          }
          
          if (giftObj) {
            if (giftObj[PF.GOODTYPE] != GIFT_TYPE) {
              cb(Config.errors.NO_SUCH_GOOD, null);
            } else {
              
              //Статистика
              let group = giftObj[PF.GROUP];
              statCtrlr.setMainStat(GIFT_GROUPS[group].stat, 1);
              
              cb(null, giftObj);
            }
          } else {
            cb(Config.errors.NO_SUCH_GOOD, null);
          }
        });
      }, //---------------------------------------------------------------
      function (giftObj, cb) { // Получаем профиль адресата
        // if(profile) {
          cb(null, profile, giftObj);
        // } else {
        //   getUserProfile(options[PF.ID], (err, friendProfile) => {
        //     if (err) {
        //       return cb(err);
        //     }
        //
        //     cb(null, friendProfile, giftObj);
        //   });
        // }
      }, //---------------------------------------------------------------
      function (friendProfile, giftObj, cb) { // Снимаем деньги с пользователя и уведомляем его об этом
        
        let count = Number(options[PF.COUNT] || 1);
        let price = giftObj[PF.PRICE] * count;
        
        selfProfile.pay(price, (err, money) => {
          if (err) {
            return cb(err, null);
          }
          
          // Статистика
          statCtrlr.setUserStat(selfProfile.getID(), selfProfile.getVID(), PF.GIFTS_GIVEN, 1);
          
          cb(null, friendProfile, giftObj);
        });
      },//---------------------------------------------------------------
      function (friendProfile, giftObj, cb) {
        let bonus = WASTE_POINTS * giftObj[PF.PRICE];
        
        selfProfile.addPoints(bonus, (err, points) => {
          if (err) {
            return cb(err, null);
          }
          
          let ranksCtrlr = oPool.roomList[socket.id].getRanks();
          ranksCtrlr.addRankBall(GENEROUS_RANK, selfProfile.getID(), options[PF.COUNT] || 1);
          
          cb(null, friendProfile, giftObj);
        });
      },//---------------------------------------------------------------
      function (friendProfile, giftObj, cb) { // Добавляем подарок адресату
        
        friendProfile.addGift(selfProfile, date, giftObj, options[PF.COUNT], options[PF.PARAMS], (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          // Статистика
          statCtrlr.setUserStat(friendProfile.getID(), friendProfile.getVID(), PF.GIFTS_TAKEN, 1);
          
          cb(null, friendProfile, giftObj);
        });
      }, //---------------------------------------------------------------
      function (friendProfile, giftObj, cb) {
        friendProfile.addPoints(GIFT_POINTS * giftObj[PF.PRICE], (err, points) => {
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
          
          cb(null, friendProfile, giftObj[PF.TYPE]);
        });
        
      } //---------------------------------------------------------------
    ], function (err, friendProfile, gtype) { // Вызывается последней. Рассылаем уведомления о подарке
      if (err) {
        return emitRes(err, socket, IO_MAKE_GIFT);
      }
      
      let giftObj = friendProfile.getGiftByType(gtype);
      
      if (!giftObj) {
        return emitRes(Config.errors.OTHER, socket, IO_MAKE_GIFT);
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
      
      emitRes(null, socket, IO_MAKE_GIFT);
      
    }); // waterfall
  }
};



