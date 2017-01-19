/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */

const logger      = require('../../log')(module);
const db          = require('../../../bin/db_manager');
const sanitize    = require('../../../bin/sanitize');
const PF          = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.ID in options ||
    !PF.TITLE in options ||
    !PF.PRICE_COINS in options ||
    !PF.PRICE_VK in options ||
    !PF.SRC in options) {
    logger.error('addCoins: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {
    [PF.ID]       : sanitize(options[PF.ID]),
    [PF.TITLE]    : sanitize(options[PF.TITLE]),
    [PF.PRICE]    : sanitize(options[PF.PRICE]),
    [PF.PRICE_VK] : sanitize(options[PF.PRICE_VK]),
    [PF.SRC]      : (options[PF.SRC])
  };
  
  db.addCoins(params, function (err) {
    if(err) {
      logger.error('addCoins:');
      logger.error(err);
      return next(err);
    }
    
    logger.debug('addCoins: ' + options[PF.ID]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

