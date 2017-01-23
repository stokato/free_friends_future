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
    !PF.PRICE in options ||
    !PF.PRICE_VK in options ||
    !PF.SRC in options) {
    logger.error('updateCoins: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = { [PF.ID] : sanitize(options[PF.ID]) };
  
  if(options[PF.TITLE])     params[PF.TITLE]      = sanitize(options[PF.TITLE]);
  if(options[PF.PRICE])     params[PF.PRICE]      = sanitize(options[PF.PRICE]);
  if(options[PF.PRICE_VK])  params[PF.PRICE_VK]   = sanitize(options[PF.PRICE_VK]);
  if(options[PF.SRC])       params[PF.SRC]        = sanitize(options[PF.SRC]);
  
  db.updateCoins(params, (err) => {
    if(err) {
      logger.error('updateCoins:');
      logger.error(err);
      return next(err);
    }
    
    logger.debug('updateCoins: ' + options[PF.ID]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

