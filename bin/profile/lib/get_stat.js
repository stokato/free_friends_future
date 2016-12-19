/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем статистику
 */

var stat = require('./../../stat_manager');

module.exports = function(callback) {
  var self = this;
  
  stat.getUserStat(this._pID, this._pVID, function (err, st) {
    if (err) { return callback(err); }
    
    return st;
  });
};