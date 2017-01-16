// Собрать в массив информацию всех играков в списке
const constants = require('./../../constants');

const PF = constants.PFIELDS;

module.exports = function () {
  let arr = [], item, player;
  for(item in this._activePlayers) if(this._activePlayers.hasOwnProperty(item)) {
    player = this._activePlayers[item];
    
    arr.push({
      [PF.ID]         : player.id,
      [PF.VID]        : player.vid,
      [PF.SEX]        : player.sex,
      [PF.INDEX]      : player.index,
      [PF.PROTECTED]  : !!this._prisonProtection[player.id]
    });
  }
  return arr;
};