/**
 *  Делаем подарок пользователю
 *
 *  @param socket, options - объект и ид пользователя, которому дарим и ид подарка, callback
 */

const async      =  require('async');

const Config          = require('./../../../../config.json');
const constants       = require('./../../../constants');
const db              = require('./../../../db_manager');
const oPool           = require('./../../../objects_pool');
const stat            = require('./../../../stat_manager');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitizer');
const getUserProfile  = require('./../common/get_user_profile');
// const setGiftTimeout  = require('./../common/set_gift_timeout');

const PF            = constants.PFIELDS;
const SF            = constants.SFIELDS;
const WASTE_POINTS  = Number(Config.points.waste);
const GIFT_POINTS   = Number(Config.points.taken_gift);



module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_MAKE_GIFT);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);

    let selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options[PF.ID]) {
      return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_MAKE_GIFT);
    }

    let date = new Date();

    async.waterfall([//---------------------------------------------------------------
      function (cb) { // Ищем подарок в магазине
        db.findGood(options[PF.GIFTID], function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            if(gift[PF.GOODTYPE] != constants.GT_GIFT) {
              cb(constants.errors.NO_SUCH_GOOD, null);
            } else {
              
              //Статистика
              addToStat(gift);
              
              cb(null, gift);
            }
          } else {
            cb(constants.errors.NO_SUCH_GOOD, null);
          }
        });
      }, //---------------------------------------------------------------
      function (gift, cb) { // Получаем профиль адресата
        
        getUserProfile(options[PF.ID], function (err, friendProfile) {
          if(err) { return cb(err); }
          
          cb(null, friendProfile, gift);
        });
      }, //---------------------------------------------------------------
      function (friendProfile, gift, cb) { // Снимаем деньги с пользователя и уведомляем его об этом
        selfProfile.pay(gift[PF.PRICE], function (err, money) {
          if(err) { return cb(err, null); }

          // Статистика
          stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), constants.SFIELDS.GIFTS_GIVEN, 1);
          
          cb(null, friendProfile, gift);
        });
      },//---------------------------------------------------------------
      function (friendProfile, gift, cb) {
        selfProfile.addPoints(WASTE_POINTS * gift[PF.PRICE], function (err, points) {
          if(err) { return cb(err, null);  }
        
          var ranks = oPool.roomList[socket.id].getRanks();
          ranks.addRankBall(constants.RANKS.GENEROUS, selfProfile.getID());
          
          cb(null, friendProfile, gift);
        });
      },//---------------------------------------------------------------
      function (friendProfile, gift, cb) { // Добавляем подарок адресату

        friendProfile.addGift(selfProfile, date, gift[PF.SRC], gift[PF.ID],  gift[PF.TYPE], gift[PF.TITLE],
                                                                      function (err, result) {
          if (err) { return cb(err, null); }

          // Статистика
          stat.setUserStat(friendProfile.getID(), friendProfile.getVID(), constants.SFIELDS.GIFTS_TAKEN, 1);
  
          cb(null, friendProfile, gift);
        });
      }, //---------------------------------------------------------------
      function (friendProfile, gift, cb) {
        friendProfile.addPoints(GIFT_POINTS * gift[PF.PRICE], function (err, points) {
          if (err) { return cb(err, null); }
          
          let friendSocket = friendProfile.getSocket();
          let ranks = oPool.roomList[friendSocket.id].getRanks();
          ranks.addRankBall(constants.RANKS.POPULAR, friendProfile.getID());
          
          cb(null, friendProfile);
        });

      } //---------------------------------------------------------------
    ], function (err, friendProfile) { // Вызывается последней. Рассылаем уведомления о подарке
      if (err) { return emitRes(err, socket, constants.IO_MAKE_GIFT); }
  
      let gift = friendProfile.getGift1();
  
      let res = {
        [PF.FID]       : selfProfile.getID(),
        [PF.FVID]      : selfProfile.getVID(),
        [PF.ID]        : friendProfile.getID(),
        [PF.VID]       : friendProfile.getVID(),
        [PF.GIFTID]    : gift[PF.GIFTID],
        [PF.SRC]       : gift[PF.SRC],
        [PF.TYPE]      : gift[PF.TYPE],
        [PF.TITLE]     : gift[PF.TITLE],
        [PF.DATE]      : gift[PF.DATE],
        [PF.UGIFTID]   : gift[PF.UGIFTID],
        [PF.ISPRIVATE] : options[PF.ISPRIVATE]
      };

  
      let room = oPool.roomList[socket.id];
  
      socket.emit(constants.IO_NEW_GIFT, res);
  
      if(!options[PF.ISPRIVATE]) {
        socket.broadcast.in(room.getName()).emit(constants.IO_NEW_GIFT, res);
      } else if(oPool.isProfile(friendProfile.getID())) {
        let friendSocket = friendProfile.getSocket();
        friendSocket.emit(constants.IO_NEW_GIFT, res);
      }
  
      // if(oPool.isProfile(friendProfile.getID())) {
      //   setGiftTimeout(friendProfile.getID());
      // }
      
      emitRes(null, socket, constants.IO_MAKE_GIFT);
      
    }); // waterfall
  
  function addToStat(gift) {
    let field, types = constants.GIFT_TYPES;
    
    switch (gift[PF.TYPE]) {
      case types.BREATH     : field = SF.GIFTS_BREATH;      break;
      case types.COMMON     : field = SF.GIFTS_COMMON;      break;
      case types.DRINKS     : field = SF.GIFTS_DRINKS;      break;
      case types.FLIRTATION : field = SF.GIFTS_FLIRTATION;  break;
      case types.FLOWERS    : field = SF.FLOWERS;           break;
      case types.LOVES      : field = SF.LOVES;             break;
      case types.MERRY      : field = SF.GIFTS_MERRY;       break;
      case types.MERRY2     : field = SF.GIFTS_MERRY;       break;
    }
    
    stat.setMainStat(field, 1);
  }
};


