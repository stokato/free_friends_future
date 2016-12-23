/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Обработчик собыития начисления очков
 */
var async = require('async');

var Config = require('./../../../../config.json');
var logger = require('./../../../../lib/log')(module);
var constants = require('./../../../constants');
var PF = constants.PFIELDS;

module.exports = function (profile) {
  
  var levelStart = Number(Config.levels.start);
  var levelStep  = Number(Config.levels.step);
  var levelBonuses = Config.levels.bonuses;
  
  var currLevel = profile.getLevel();
  var currPoints = profile.getPoints();
  
  var levelPoints = (currLevel - 1) * levelStep + levelStart;
  var dPoints = currPoints - levelPoints;
  
  var needLevel = 0;
  var p = 0;
  
  while (p < dPoints) {
    p += levelStep;
    needLevel++;
  }
  
  if(currLevel <= needLevel) { return; }
  
  async.waterfall([
    function (cb) { //---------------------------------------
      profile.setLevel(needLevel, function (err, level) {
        if(err) { return cb(err, null); }
        
        var key = level.toString();
        var bonuses = levelBonuses[key];
        
        cb(null, bonuses);
      });
    },//---------------------------------------
    function (bonuses, cb) {
      if(bonuses && bonuses.gifts > 0) {
        var freeGifts = profile.getFreeGifts() + Number(bonuses.gifts);
        profile.setFreeGifts(freeGifts, function (err, count) {
          if(err) { return cb(err, null); }
          
          cb(null, bonuses);
        })
      } else cb(null, bonuses);
    },//---------------------------------------
    function (bonuses, cb) {
      if(bonuses && bonuses.music > 0) {
        var freeMusic = profile.getFreeMusic() + Number(bonuses.music);
        profile.setFreeMusic(freeMusic, function (err, count) {
          if(err) { return cb(err, null); }
        
          cb(null, bonuses);
        })
      } else cb(null, bonuses);
    },//---------------------------------------
    function (bonuses, cb) {
      if(bonuses && bonuses.coins > 0) {
        var money = profile.getMoney() + Number(bonuses.coins);
        profile.setMoney(money, function (err, money) {
          if(err) { return cb(err, null); }
        
          cb(null, bonuses);
        })
      } else cb(null, bonuses);
    },//---------------------------------------
    function (bonuses, cb) {
      if(bonuses && bonuses.vip && !profile.isVIP()) {
        profile.setVIP(true, function (err, vip) {
          if(err) { return cb(err, null); }
        
          cb(null, bonuses, true);
        })
      } else cb(null, bonuses, false);
    } //---------------------------------------
  ], function (err, bonuses, newVIP) {
    if(err) { logger.error('handleAddPoints: ' + err); }
    
    var socket = profile.getSocket();
    if(socket) {
      var res = {};
      res[PF.LEVEL]       = profile.getLevel();
      res[PF.FREE_GIFTS]  = bonuses.gifts;
      res[PF.FREE_TRACKS] = bonuses.music;
      res[PF.MONEY]       = bonuses.coins;
      res[PF.VIP]         = newVIP;
      
      socket.emit(constants.IO_NEW_LEVEL, res);
      
      profile.getMoney(function (err, money) {
        if(err) { logger.error('handleAddPoints' + err); }
  
        res = {};
        res[PF.MONEY] = money;
        
        socket.emit(constants.IO_GET_MONEY, res);
      });
    }
  });
};
