/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу данных свой вопрос
 *
 */

const logger      = require('../../log')(module);
const constants   = require('../../../bin/constants');
const db          = require('../../../bin/db_manager');
const sanitize    = require('../../../bin/sanitizer');
const PF          = constants.PFIELDS;

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.TEXT in options || !PF.IMAGE_1 in options || !PF.IMAGE_2 in options || !PF.IMAGE_3 in options) {
    logger.error('addQuestion: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let params = {
    [PF.TEXT]    : sanitize(options[PF.TEXT]),
    [PF.IMAGE_1] : sanitize(options[PF.IMAGE_1]),
    [PF.IMAGE_2] : sanitize(options[PF.IMAGE_2]),
    [PF.IMAGE_3] : sanitize(options[PF.IMAGE_3])
  };
  
  db.addQuestion(params, function (err) {
    if(err) {
      logger.error('addQuestion:');
      logger.error(err);
      return next(err);
    }
  
    logger.debug('addQuestion: ' + options[PF.TEXT]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

