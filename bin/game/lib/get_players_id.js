/**
 * Собрать в массив информацию всех играков в списке
 */

const PF = require('./../../const_fields');

module.exports = function () {
  let arr = [], item, playerInfoObj;
  for(item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    playerInfoObj = this._activePlayers[item];
    
    arr.push({
      [PF.ID]         : playerInfoObj.id,
      [PF.VID]        : playerInfoObj.vid,
      [PF.SEX]        : playerInfoObj.sex,
      [PF.INDEX]      : playerInfoObj.index,
      [PF.PROTECTED]  : !!this._prisonProtection[playerInfoObj.id]
    });
  }
  return arr;
};