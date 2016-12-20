/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 *  Удаляем вопросы из базы
 */

var db = require('../../../bin/db_manager');
var constants = require('../../../bin/constants');
var PF = constants.PFIELDS;
var logger    = require('../../log')(module);
var sanitize = require('../../../bin/sanitizer');

module.exports = function(req, res, next) {
  
  var options = req.body;
  
  if(!PF.QUESTIONS in options || !(options[PF.QUESTIONS] instanceof Array)) {
    logger.error('addUserQuestions: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  var idList = [];
  
  for(var i = 0; i < options[PF.QUESTIONS].length; i++) {
    idList.push(sanitize(options[PF.QUESTIONS][i]));
  }
  
  db.deleteQuestions(idList, function (err) {
    if(err) {
      logger.error('deleteUserQuestions: ' + err.message);
      return next(err);
    }
    
    res.statusCode = 200;
    res.end();
  });
  
};