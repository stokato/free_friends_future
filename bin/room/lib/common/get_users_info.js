/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 *
 * Получаем сведения о пользователях одного пола в комнате
 */

const constants = require('./../../../constants'),
    fillInfo  = require('./fill_info');

module.exports = function (sex) {
  let item, info = [], gInfo;
  
  let arr = (sex == constants.GUY)? this._guys : this._girls;
  
  for (item in arr) if (arr.hasOwnProperty(item)){
    gInfo = fillInfo(arr[item]);
    info.push(gInfo);
  }
  
  return info;
};