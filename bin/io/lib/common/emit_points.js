/**
 * Created by s.t.o.k.a.t.o on 29.12.2016.
 *
 * Сообщяем о полученном опыте
 */

const Config          = require('./../../../../config.json');
const calcNeedPoints  = require('./calc_need_points');
const PF              = require('./../../../const_fields');

module.exports =  function emitPoitns(profile, points) {
  const levelStart = Number(Config.levels.start);
  const levelStep  = Number(Config.levels.step);
  const levelBonuses = Config.levels.bonuses;
  
  let socket    = profile.getSocket();
  let currLevel = profile.getLevel();
  let currPoints = profile.getPoints();
  
  let nextLP   = calcNeedPoints(currLevel+1, levelStart, levelStep);
  let currLP   = calcNeedPoints(currLevel, levelStart, levelStep);
  let progress = Math.floor((currPoints - currLP ) / (nextLP - currLP) * 100) ;
  
  let key = (currLevel + 1).toString();
  let bonusesObj = levelBonuses[key] || {};
  
  let newVIP = (bonusesObj && bonusesObj.vip && !profile.isVIP());
  
  if(socket) {
  
    let res = {
      [PF.LEVEL]             : profile.getLevel(),
      [PF.POINTS]            : points,
      [PF.ALL_POINTS]        : currPoints,
      [PF.NEW_LEVEL_POINTS]  : nextLP,
      [PF.CURR_LEVEL_POINTS] : currLP,
      [PF.PROGRESS]          : progress,
      [PF.FREE_GIFTS]        : bonusesObj.gifts || 0,
      [PF.FREE_TRACKS]       : bonusesObj.music || 0,
      [PF.MONEY]             : bonusesObj.coins || 0,
      [PF.VIP]               : newVIP
    };
    
    socket.emit(Config.io.emits.IO_ADD_POINTS, res);
  }
};