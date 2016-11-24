/**
 * Created by s.t.o.k.a.t.o on 17.11.2016.
 */

var constants = require('./../../../constants'),
    fillInfo  = require('./fill_info');

module.exports = function (sex) {
  var item, info = [], gInfo;
  
  var arr = (sex == constants.GUY)? this._guys : this._girls;
  
  for (item in arr) if (arr.hasOwnProperty(item)){
    gInfo = fillInfo(arr[item]);
    info.push(gInfo);
  }
  
  return info;
};