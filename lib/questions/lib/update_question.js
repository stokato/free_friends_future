/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */

const logger      = require('../../log')(module);
const db          = require('../../../bin/db_controller');
const sanitize    = require('../../../bin/sanitize');
const PF          = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.ID in options) {
    logger.error('updateGift: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {};
  if(options[PF.ID])           params[PF.ID]           = sanitize(options[PF.ID]);
  if(options[PF.TEXT])         params[PF.TEXT]         = sanitize(options[PF.TEXT]);
  if(options[PF.IMAGE_1])      params[PF.IMAGE_1]      = options[PF.IMAGE_1];
  if(options[PF.IMAGE_2])      params[PF.IMAGE_2]      = options[PF.IMAGE_2];
  if(options[PF.IMAGE_3])      params[PF.IMAGE_3]      = options[PF.IMAGE_3];

  
  db.updateQuestion(params, (err) => {
    if(err) {
      logger.error('updateQuestion:');
      logger.error(err);
      return next(err);
    }
    
    logger.debug('updateQuestion: ' + options[PF.ID]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

