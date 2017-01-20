/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 *
 * Сохраняем выбор ирока
 */

module.exports = function (key, val) {
  this._actionsLimits[key] --;
  
  if(!this._actionsQueue[key]) {
    this._actionsQueue[key] = [];
  }
  
  this._actionsQueue[key].push(val);
  this._actionsCount--;
};