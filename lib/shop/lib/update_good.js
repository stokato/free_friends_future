/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */

const logger      = require('../../log')(module);
const db          = require('../../../bin/db_controller');
const sanitize    = require('../../../bin/sanitize');
const PF          = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.ID in options ||
    !PF.TITLE in options ||
    !PF.PRICE_COINS in options ||
    !PF.SRC in options ||
    !PF.GROUP in options ||
    !PF.GROUP_TITLE in options ||
    !PF.TYPE in options ||
    !PF.RANK in options ||
    !PF.LEVEL in options) {
    logger.error('updateGift: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {};
  if(options[PF.ID])           params[PF.ID]           = sanitize(options[PF.ID]);
  if(options[PF.TITLE])        params[PF.TITLE]        = sanitize(options[PF.TITLE]);
  if(options[PF.PRICE])        params[PF.PRICE]        = sanitize(options[PF.PRICE]);
  if(options[PF.SRC])          params[PF.SRC]          = sanitize(options[PF.SRC]);
  if(options[PF.GROUP])        params[PF.GROUP]        = sanitize(options[PF.GROUP]);
  if(options[PF.GROUP_TITLE])  params[PF.GROUP_TITLE]  = sanitize(options[PF.GROUP_TITLE]);
  if(options[PF.TYPE])         params[PF.TYPE]         = sanitize(options[PF.TYPE]);
  if(options[PF.RANK])         params[PF.RANK]         = sanitize(options[PF.RANK]);
  if(options[PF.LEVEL])        params[PF.LEVEL]        = sanitize(options[PF.LEVEL]);
  
  db.updateGood(params, (err) => {
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

