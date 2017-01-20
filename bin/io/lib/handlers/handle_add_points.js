/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Обработчик собыития начисления очков
 */
const async = require('async');

const Config  = require('./../../../../config.json');
const PF      = require('./../../../const_fields');
const oPool   = require('./../../../objects_pool');
const logger  = require('./../../../../lib/log')(module);

const calcNeedPoints = require('./../common/calc_need_points');
const emitPoints     = require('./../common/emit_points');

module.exports = function (profile, points) {
  
  const levelStart = Number(Config.levels.start);
  const levelStep  = Number(Config.levels.step);
  const levelBonusesObj = Config.levels.bonuses;
  
  let currLevel  = profile.getLevel();
  let currPoints = profile.getPoints();

  let needPoints = calcNeedPoints(currLevel+1, levelStart, levelStep);
  
  let dPoints = needPoints - currPoints;
  
  if(dPoints <= 0) {
    let newLevel = currLevel + 1;
    
    async.waterfall([
      function (cb) { //---------------------------------------
        profile.setLevel(newLevel, (err, level) => {
          if(err) {
            return cb(err, null);
          }
        
          let key = level.toString();
          let bonusesObj = levelBonusesObj[key];
        
          cb(null, bonusesObj);
        });
      },//---------------------------------------
      function (bonusesObj, cb) {
        if(bonusesObj && bonusesObj.gifts > 0) {
          let freeGiftsCount = profile.getFreeGifts() + Number(bonusesObj.gifts);
          
          profile.setFreeGifts(freeGiftsCount, (err, count) => {
            if(err) {
              return cb(err, null);
            }
          
            cb(null, bonusesObj);
          })
        } else cb(null, bonusesObj);
      },//---------------------------------------
      function (bonusesObj, cb) {
        if(bonusesObj && bonusesObj.music > 0) {
          
          let freeMusic = profile.getFreeMusic() + Number(bonusesObj.music);
          
          profile.setFreeMusic(freeMusic, (err, count) => {
            if(err) {
              return cb(err, null);
            }
          
            cb(null, bonusesObj);
          })
        } else cb(null, bonusesObj);
      },//---------------------------------------
      function (bonuses, cb) {
        if(bonuses && bonuses.coins > 0) {
          profile.earn(Number(bonuses.coins), (err, money) => {
            if(err) {
              return cb(err, null);
            }
  
            cb(null, bonuses);
          });
        } else cb(null, bonuses);
      },//---------------------------------------
      function (bonuses, cb) {
        if(bonuses && bonuses.vip && !profile.isVIP()) {
          
          profile.setVIP(true, (err, vip) => {
            if(err) {
              return cb(err, null);
            }
          
            cb(null, bonuses, true);
          })
        } else cb(null, bonuses, false);
      } //---------------------------------------
    ], function (err, bonuses, newVIP) { bonuses = bonuses || {};
      if(err) {
        return logger.error('handleAddPoints: ' + err);
      }
    
      let socket = profile.getSocket();
      if(socket) {
  
        let resObj = {
          [PF.LEVEL]       : profile.getLevel(),
          [PF.FREE_GIFTS]  : bonuses.gifts || 0,
          [PF.FREE_TRACKS] : bonuses.music || 0,
          [PF.MONEY]       : bonuses.coins || 0,
          [PF.VIP]         : newVIP,
        };
      
        socket.emit(Config.io.emits.IO_ADD_LEVEL, resObj);
        
        let room = oPool.roomList[socket.id];
        socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_NEW_LEVEL, {
          [PF.ID] : profile.getID(),
          [PF.VID] : profile.getVID(),
          [PF.LEVEL] : profile.getLevel(),
          [PF.VIP] : profile.isVIP()
        });
      
        profile.getMoney((err, money) => {
          if(err) {
            logger.error('handleAddPoints' + err);
          }
        
          resObj = { [PF.MONEY] : money };
        
          socket.emit(Config.io.emits.IO_GET_MONEY, resObj);
  
          emitPoints(profile, points);
        });
      }
    });
  } else {
    emitPoints(profile, points);
  }
  
};
