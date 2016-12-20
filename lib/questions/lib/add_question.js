/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу данных свой вопрос
 *
 */

var db = require('../../../bin/db_manager');
var constants = require('../../../bin/constants');
var PF = constants.PFIELDS;
var logger    = require('../../log')(module);
var sanitize = require('../../../bin/sanitizer');

module.exports = function(req, res, next) {
  
  var options = req.body;
  
  if(!PF.TEXT in options || !PF.IMAGE_1 in options || !PF.IMAGE_2 in options || !PF.IMAGE_3 in options) {
    logger.error('addQuestion: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  var params = {};
  params[PF.TEXT]    = sanitize(options[PF.TEXT]);
  params[PF.IMAGE_1] = sanitize(options[PF.IMAGE_1]);
  params[PF.IMAGE_2] = sanitize(options[PF.IMAGE_2]);
  params[PF.IMAGE_3] = sanitize(options[PF.IMAGE_3]);
  
  db.addQuestion(params, function (err) {
    if(err) {
      logger.error('addQuestion: ' + err.message);
      return next(err);
    }
  
    logger.debug('addQuestion: ' + options[PF.TEXT]);
    
    res.statusCode = 200;
    res.end();
  });
  
};

