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

module.exports = function (profile, points) {
  
  var levelStart = Number(Config.levels.start);
  var levelStep  = Number(Config.levels.step);
  var levelBonuses = Config.levels.bonuses;
  
  var currLevel = profile.getLevel();
  var currPoints = profile.getPoints();

  var needPoints = calcNeedPoints(currLevel+1, levelStart, levelStep);
  var isPoints = calcNeedPoints(currLevel, levelStart, levelStep);
  var progress = Math.floor((profile.getPoints() - isPoints ) / (needPoints - isPoints) * 100) ;
  
  
  var dPoints = needPoints - currPoints;
  
  if(dPoints <= 0) {
    var newLevel = currLevel + 1;
    
    async.waterfall([
      function (cb) { //---------------------------------------
        profile.setLevel(newLevel, function (err, level) {
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
    ], function (err, bonuses, newVIP) { bonuses = bonuses || {};
      if(err) { return logger.error('handleAddPoints: ' + err); }
    
      var socket = profile.getSocket();
      if(socket) {
        var res = {};
        res[PF.LEVEL]       = profile.getLevel();
        res[PF.FREE_GIFTS]  = bonuses.gifts || 0;
        res[PF.FREE_TRACKS] = bonuses.music || 0;
        res[PF.MONEY]       = bonuses.coins || 0;
        res[PF.VIP]         = newVIP;
      
        socket.emit(constants.IO_NEW_LEVEL, res);
      
        profile.getMoney(function (err, money) {
          if(err) { logger.error('handleAddPoints' + err); }
        
          res = {};
          res[PF.MONEY] = money;
        
          socket.emit(constants.IO_GET_MONEY, res);
          
          emitPoitns();
        });
      }
    });
  } else {
    emitPoitns();
  }
  
  function emitPoitns() {
    var socket = profile.getSocket();
    currLevel = profile.getLevel();
    var needPoints = calcNeedPoints(currLevel+1, levelStart, levelStep);
    var isPoints = calcNeedPoints(currLevel, levelStart, levelStep);
    var progress = Math.floor((profile.getPoints() - isPoints ) / (needPoints - isPoints) * 100) ;
  
    var key = (currLevel + 1).toString();
    var bonuses = levelBonuses[key] || {};
  
    var newVIP = (bonuses && bonuses.vip && !profile.isVIP());
  
    if(socket) {
      var res = {};
      res[PF.LEVEL]             = profile.getLevel();
      res[PF.POINTS]            = points;
      res[PF.ALL_POINTS]        = profile.getPoints();
      res[PF.NEW_LEVEL_POINTS]  = needPoints;
      res[PF.CURR_LEVEL_POINTS] = isPoints;
      res[PF.PROGRESS]          = progress;
      res[PF.FREE_GIFTS]        = bonuses.gifts || 0;
      res[PF.FREE_TRACKS]       = bonuses.music || 0;
      res[PF.MONEY]             = bonuses.coins || 0;
      res[PF.VIP]               = newVIP;
    
      socket.emit(constants.IO_ADD_POINTS, res);
    }
  }
  
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
