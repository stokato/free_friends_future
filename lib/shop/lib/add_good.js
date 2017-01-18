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
  
  if(//!PF.ID in options ||
    //PF.TITLE in options != true ||
    PF.PRICE in options != true ||
    PF.SRC in options != true ||
    PF.GROUP in options != true ||
    PF.GROUP_TITLE in options != true ||
    PF.TYPE in options != true ||
    PF.RANK in options != true ||
    PF.LEVEL in options != true) {
    logger.error('addGift: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {
    //[PF.ID]           : sanitize(options[PF.ID]),
    [PF.TITLE]        : sanitize(options[PF.TITLE]),
    [PF.PRICE]        : sanitize(options[PF.PRICE]),
    [PF.SRC]          : (options[PF.SRC]),
    [PF.GROUP]        : sanitize(options[PF.GROUP]),
    [PF.GROUP_TITLE]  : sanitize(options[PF.GROUP_TITLE]),
    [PF.TYPE]         : sanitize(options[PF.TYPE]),
    [PF.RANK]         : sanitize(options[PF.RANK]) || null,
    [PF.LEVEL]        : sanitize(options[PF.LEVEL])
  };
  
  db.addGood(params, function (err) {
    if(err) {
      logger.error('addGift:');
      logger.error(err);
      return next(err);
    }
    
    logger.debug('addGift: ' + options[PF.ID]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

