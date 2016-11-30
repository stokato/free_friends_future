/**
 *  Делаем подарок пользователю
 *
 *  @param socket, options - объект и ид пользователя, которому дарим и ид подарка, callback
 */

var async      =  require('async');

var constants      = require('./../../../constants'),
  PF               = constants.PFIELDS,
  getUserProfile   = require('./../common/get_user_profile'),
  setGiftTimeout   = require('./../common/set_gift_timeout'),
  db               = require('./../../../db_manager'),
  oPool            = require('./../../../objects_pool');

module.exports = function (socket, options, callback) {

    var selfProfile = oPool.userList[socket.id];

    if (selfProfile.getID() == options[PF.ID]) {
      return callback(constants.errors.SELF_ILLEGAL);
    }

    var date = new Date();

    async.waterfall([//---------------------------------------------------------------
      function (cb) { // Ищем подарок в магазине
        db.findGood(options[PF.GIFTID], function (err, gift) {
          if (err) { return cb(err, null) }

          if (gift) {
            if(gift[PF.GOODTYPE] != constants.GT_GIFT) {
              cb(constants.errors.NO_SUCH_GOOD, null);
            } else {
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
          
          var res = {};
          res[PF.MONEY] = money;
          
          socket.emit(constants.IO_GET_MONEY, res);
          
          cb(null, friendProfile, gift);
        });
      },//---------------------------------------------------------------
      function (friendProfile, gift, cb) { // Добавляем подарко адресату

        friendProfile.addGift(selfProfile, date, gift[PF.SRC], gift[PF.ID],  gift[PF.TYPE], gift[PF.TITLE],
                                                                      function (err, result) {
          if (err) { return cb(err, null); }

          cb(null, friendProfile);
        });

      } //---------------------------------------------------------------
    ], function (err, friendProfile) { // Вызывается последней. Рассылаем уведомления о подарке
      if (err) { return callback(err); }
  
      var gift = friendProfile.getGift1();
  
      var res = {};
      res[PF.FID]       = selfProfile.getID();
      res[PF.FVID]      = selfProfile.getVID();
      res[PF.ID]        = friendProfile.getID();
      res[PF.VID]       = friendProfile.getVID();
      res[PF.GIFTID]    = gift[PF.GIFTID];
      res[PF.SRC]       = gift[PF.SRC];
      res[PF.TYPE]      = gift[PF.TYPE];
      res[PF.TITLE]     = gift[PF.TITLE];
      res[PF.DATE]      = gift[PF.DATE];
      res[PF.UGIFTID]   = gift[PF.UGIFTID];
      res[PF.ISPRIVATE] = options[PF.ISPRIVATE];
  
      var room = oPool.roomList[socket.id];
  
      socket.emit(constants.IO_NEW_GIFT, res);
  
      if(!options[PF.ISPRIVATE]) {
        socket.broadcast.in(room.getName()).emit(constants.IO_NEW_GIFT, res);
      } else if(oPool.isProfile(friendProfile.getID())) {
        var friendSocket = friendProfile.getSocket();
        friendSocket.emit(constants.IO_NEW_GIFT, res);
      }
  
      if(oPool.isProfile(friendProfile.getID())) {
        setGiftTimeout(friendProfile.getID());
      }
  
      callback(null, null);
      
    }); // waterfall
};


