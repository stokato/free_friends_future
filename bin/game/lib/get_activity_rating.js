/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Опредяем уровень активности в игре
 */

module.exports = function () {
  
  const RATINGS = require('./../../../config.json').game.activity_ratings;
  
  if(this._actionsCount == 0) {
    return RATINGS.ALL;
  }
  if(this._actionsCount == this._actionsMain) {
    return RATINGS.NONE;
  }
  
  let val = this._actionsMain / 2;
  
  if(this._actionsCount < val) {
    return RATINGS.HALF_MORE;
  }
  
  return RATINGS.HALF_LESS;
};