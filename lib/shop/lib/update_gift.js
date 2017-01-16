/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */

const logger      = require('../../log')(module);
const constants   = require('../../../bin/constants');
const db          = require('../../../bin/db_manager');
const sanitize    = require('../../../bin/sanitize');
const PF          = constants.PFIELDS;

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.ID in options ||
    !PF.TITLE in options ||
    !PF.PRICE_COINS in options ||
    !PF.SRC in options ||
    !PF.GROUP in options ||
    !PF.GROUP_TITLE) {
    logger.error('updateGift: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {
    [PF.ID]           : sanitize(options[PF.ID]),
    [PF.TITLE]        : sanitize(options[PF.TITLE]),
    [PF.PRICE]        : sanitize(options[PF.PRICE_COINS]),
    [PF.SRC]          : (options[PF.SRC]),
    [PF.GROUP]        : sanitize(options[PF.GROUP]),
    [PF.GROUP_TITLE]  : sanitize(options[PF.GROUP_TITLE])
  };
  
  db.updateCoinInShop(params, function (err) {
    if(err) {
      logger.error('updateGift:');
      logger.error(err);
      return next(err);
    }
    
    logger.debug('updateGift: ' + options[PF.ID]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

