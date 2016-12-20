/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем общую статистику
 *
 */

var stat = require('../../../bin/stat_manager');
var logger    = require('../../log')(module);

module.exports = function(req, res, next) {
  
  //return res.redirect(path.join(__dirname));
    
  stat.getMainStat(function (err, st) {
    if(err) {
      logger.error('getMainStat: ' + err.message);
      return next(err);
    }
  
    var stJSON = JSON.stringify(st);
    
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(stJSON);
  });
};
