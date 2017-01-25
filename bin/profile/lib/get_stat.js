/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем статистику
 */

const stat = require('./../../stat_controller');

module.exports = function(callback) {
  
  stat.getUserStat(this._pID, this._pVID, function (err, st) {
    if (err) { return callback(err); }
    
    callback(null, st);
  });
};