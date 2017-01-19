/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */

const logger    = require('../../log')(module);
const db        = require('../../../bin/db_manager');

const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  db.findAllCoins(function (err, goods) {
    if(err) {
      logger.error('getCoins:');
      logger.error(err);
      return next(err);
    }
    
    let resJSON = JSON.stringify({ [PF.CONTENT] : goods });
    
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
