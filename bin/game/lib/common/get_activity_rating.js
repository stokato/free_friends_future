/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Опредяем уровень активности в игре
 *
 */

var RATINGS = require('./../../../constants').ACTIVITY_RATINGS;

module.exports = function () {
  if(this._actionsCount == 0) {
    return RATINGS.ALL;
  }
  if(this._actionsCount == this._actionsMain) {
    return RATINGS.NONE;
  }
  
  var val = this._actionsMain / 2;
  
  if(this._actionsCount < val) {
    return RATINGS.HALF_MORE;
  }
  
  return RATINGS.HALF_LESS;
};