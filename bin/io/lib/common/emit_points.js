/**
 * Created by s.t.o.k.a.t.o on 29.12.2016.
 *
 * Сообщяем о полученном опыте
 */

const constants       = require('./../../../constants');
const Config          = require('./../../../../config.json');
const calcNeedPoints  = require('./calc_need_points');
const PF              = constants.PFIELDS;

module.exports =  function emitPoitns(profile, points) {
  let levelStart = Number(Config.levels.start);
  let levelStep  = Number(Config.levels.step);
  let levelBonuses = Config.levels.bonuses;
  
  let socket    = profile.getSocket();
  let currLevel = profile.getLevel();
  let currPoints = profile.getPoints();
  
  let nextLP   = calcNeedPoints(currLevel+1, levelStart, levelStep);
  let currLP   = calcNeedPoints(currLevel, levelStart, levelStep);
  let progress = Math.floor((currPoints - currLP ) / (nextLP - currLP) * 100) ;
  
  let key = (currLevel + 1).toString();
  let bonuses = levelBonuses[key] || {};
  
  let newVIP = (bonuses && bonuses.vip && !profile.isVIP());
  
  if(socket) {
  
    let res = {
      [PF.LEVEL]             : profile.getLevel(),
      [PF.POINTS]            : points,
      [PF.ALL_POINTS]        : currPoints,
      [PF.NEW_LEVEL_POINTS]  : nextLP,
      [PF.CURR_LEVEL_POINTS] : currLP,
      [PF.PROGRESS]          : progress,
      [PF.FREE_GIFTS]        : bonuses.gifts || 0,
      [PF.FREE_TRACKS]       : bonuses.music || 0,
      [PF.MONEY]             : bonuses.coins || 0,
      [PF.VIP]               : newVIP
    };
    
    socket.emit(constants.IO_ADD_POINTS, res);
  }
};