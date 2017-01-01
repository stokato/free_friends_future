/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем статистику пользователя
 *
 */

const logger    = require('../../log')(module);

const constants = require('../../../bin/constants');
const db        = require('../../../bin/db_manager');
const stat      = require('../../../bin/stat_manager');

module.exports = function(req, res, next) {
  
  //return res.redirect(path.join(__dirname));
  
  let vid = req.params['vid'].slice(1);
  
  db.findUser(null, vid, [constants.PFIELDS.ID], function (err, info) {
    if(err) {
      logger.error('getUserStat: ' + err.message);
      return next(err);
    }
    
    if(!info) {
      logger.error('getUserStat: ' + "no such user in DB");
      return next();
    }
  
    stat.getUserStat(info[constants.PFIELDS.ID], vid, function (err, st) {
      if(err) {
        logger.error('getUserStat: ' + err.message);
        return next(err);
      }
      
      if(!st) {
        return next();
      }
    
      let stJSON = JSON.stringify(st);
    
      res.setHeader("Content-Type", "text/json");
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(stJSON);
    });
  });
  
};

