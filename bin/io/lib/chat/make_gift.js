/**
 *  Делаем подарок пользователю
 *
 *  @param socket, options - объект и ид пользователя, которому дарим и ид подарка, callback
 */

const async      =  require('async');

const Config          = require('./../../../../config.json');
const PF       = require('./../../../const_fields');
const db              = require('./../../../db_manager');
const oPool           = require('./../../../objects_pool');
const stat            = require('./../../../stat_manager');

const checkID         = require('./../../../check_id');
const emitRes         = require('./../../../emit_result');
const sanitize        = require('./../../../sanitize');
const getUserProfile  = require('./../common/get_user_profile');

const WASTE_POINTS  = Number(Config.points.waste);
const GIFT_POINTS   = Number(Config.points.taken_gift);
const GIFT_TYPE     = Config.good_types.gift;
const GENEROUS_RANK = Config.ranks.generous.name;
const POPULAR_RANK  = Config.ranks.popular.name;
const GIFT_GROUPS   = Config.gifts.groups;
const IO_MAKE_GIFT  = Config.io.emits.IO_MAKE_GIFT;
const IO_NEW_GIFT   = Config.io.emits.IO_NEW_GIFT;

module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_MAKE_GIFT);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_MAKE_GIFT);
  }
  
  let date = new Date();
  
  async.waterfall([//---------------------------------------------------------------
    function (cb) { // Ищем подарок в магазине
      db.findGood(options[PF.GIFTID], function (err, gift) {
        if (err) { return cb(err, null) }
        
        if (gift) {
          if(gift[PF.GOODTYPE] != GIFT_TYPE) {
            cb(Config.errors.NO_SUCH_GOOD, null);
          } else {
            
            //Статистика
            let group = gift[PF.GROUP];
            stat.setMainStat(GIFT_GROUPS[group].stat, 1);
            
            cb(null, gift);
          }
        } else {
          cb(Config.errors.NO_SUCH_GOOD, null);
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
        stat.setUserStat(selfProfile.getID(), selfProfile.getVID(), PF.GIFTS_GIVEN, 1);
        
        cb(null, friendProfile, gift);
      });
    },//---------------------------------------------------------------
    function (friendProfile, gift, cb) {
      selfProfile.addPoints(WASTE_POINTS * gift[PF.PRICE], function (err, points) {
        if(err) { return cb(err, null);  }
        
        let ranks = oPool.roomList[socket.id].getRanks();
        ranks.addRankBall(GENEROUS_RANK, selfProfile.getID());
        
        cb(null, friendProfile, gift);
      });
    },//---------------------------------------------------------------
    function (friendProfile, gift, cb) { // Добавляем подарок адресату
      
      friendProfile.addGift(selfProfile, date, gift, options[PF.PARAMS], (err, result) => {
        if (err) { return cb(err, null); }
  
        // Статистика
        stat.setUserStat(friendProfile.getID(), friendProfile.getVID(), PF.GIFTS_TAKEN, 1);
  
        cb(null, friendProfile, gift);
        });
    }, //---------------------------------------------------------------
    function (friendProfile, gift, cb) {
      friendProfile.addPoints(GIFT_POINTS * gift[PF.PRICE], function (err, points) {
        if (err) { return cb(err, null); }
        
        let selfRoom = oPool.roomList[socket.id];
        
        let friendSocket = friendProfile.getSocket();
        if(friendSocket) {
          let friendRoom = oPool.roomList[friendSocket.id];
          
          if(selfRoom.getName() == friendRoom.getName()) {
            let ranks = oPool.roomList[friendSocket.id].getRanks();
            ranks.addRankBall(POPULAR_RANK, friendProfile.getID());
          }
        }
        
        cb(null, friendProfile, gift[PF.TYPE]);
      });
      
    } //---------------------------------------------------------------
  ], function (err, friendProfile, gtype) { // Вызывается последней. Рассылаем уведомления о подарке
    if (err) { return emitRes(err, socket, IO_MAKE_GIFT); }
    
    let gift = friendProfile.getGiftByType(gtype);
    
    if(!gift) {
      return emitRes(Config.errors.OTHER, socket, IO_MAKE_GIFT);
    }
    
    let res = {
      [PF.FID]       : selfProfile.getID(),
      [PF.FVID]      : selfProfile.getVID(),
      [PF.ID]        : friendProfile.getID(),
      [PF.VID]       : friendProfile.getVID(),
      [PF.GIFTID]    : gift[PF.ID],
      [PF.SRC]       : gift[PF.SRC],
      [PF.TYPE]      : gift[PF.TYPE],
      [PF.GROUP]     : gift[PF.GROUP],
      [PF.TITLE]     : gift[PF.TITLE],
      [PF.DATE]      : gift[PF.DATE],
      [PF.UGIFTID]   : gift[PF.UGIFTID],
      [PF.ISPRIVATE] : options[PF.ISPRIVATE],
      [PF.PARAMS]    : gift[PF.PARAMS]
    };
    
    let room = oPool.roomList[socket.id];
    
    socket.emit(IO_NEW_GIFT, res);
    
    if(!options[PF.ISPRIVATE]) {
      socket.broadcast.in(room.getName()).emit(IO_NEW_GIFT, res);
    } else if(oPool.isProfile(friendProfile.getID())) {
      let friendSocket = friendProfile.getSocket();
      friendSocket.emit(IO_NEW_GIFT, res);
    }
    
    emitRes(null, socket, IO_MAKE_GIFT);
    
  }); // waterfall
};



