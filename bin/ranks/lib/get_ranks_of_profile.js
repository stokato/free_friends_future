/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Получаем все ранги пользователя по его ИД
 */

var Config = require('./../../../config.json');
var constants = require('./../../constants');
var PF = constants.PFIELDS;

module.exports = function (uid) {
  
  if(!this._profiles[uid]) {
    return null;
  }
  
  var ranks = {};
  
  for(var item in constants.RANKS) if(constants.RANKS.hasOwnProperty(item)) {
    var rank = constants.RANKS[item];
    
    var rankStart = Number(Config.ranks[rank].start);
    var rankStep = Number(Config.ranks[rank].step);
    
    var rankInfo = {};
    
    rankInfo[PF.ISOWNER] = (this._rankOwners[rank] == uid);
    
    if(!rankInfo[PF.ISOWNER]) {
      rankInfo[PF.BALLS] = this._profiles[uid][rank];
  
      if(this._rankOwners[rank]) {
        rankInfo[PF.NEED_BALLS] = this._profiles[this._rankOwners[rank]][rank] + rankStep;
      } else {
        
        var needBalls = rankStart;
        if(needBalls <= rankInfo[PF.BALLS]) { // Если владевший званием ушел
          rankInfo[PF.NEED_BALLS] = needBalls + 1;
        } else {    // Если в конмте никто еще не присвоил звание
          rankInfo[PF.NEED_BALLS] = needBalls;
        }
    
      }
    }
    
    ranks[rank] = rankInfo;
        
  }
  
  return ranks;
};
