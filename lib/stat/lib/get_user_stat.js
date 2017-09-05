/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем статистику пользователя
 *
 */

const logger    = require('../../log')(module);

const PF = require('../../../bin/const_fields');
const db        = require('../../../bin/db_controller');
const stat      = require('../../../bin/stat_controller');

module.exports = function(req, res, next) {
  
  //return res.redirect(path.join(__dirname));
  
  let vid = req.params['vid'];
  
  let fList = [PF.ID, PF.BDATE, PF.MONEY, PF.SEX, PF.POINTS, PF.ISMENU, PF.LEVEL, PF.VIP];
  
  db.findUser(null, vid, fList, (err, info) => {
    if(err) {
      logger.error('getUserStat: ' + err.message);
      return next(err);
    }
    
    if(!info) {
      logger.error('getUserStat: ' + "no such user in DB");
      return next();
    }
  
    stat.getUserStat(info[PF.ID], vid, (err, st) => {
      if(err) {
        logger.error('getUserStat: ' + err.message);
        return next(err);
      }
      
      if(!st) {
        return next();
      }
      
      let userInfo = {
        info: info,
        stat: st
      };
    
      let resJSON = JSON.stringify(userInfo);
    
      res.setHeader("Content-Type", "text/json");
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      res.end(resJSON);
    });
  });
  
};

