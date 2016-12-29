/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Удаляем вопросы пользователей из базы
 */

const logger      = require('../../log')(module);
const constants   = require('../../../bin/constants');
const db          = require('../../../bin/db_manager');
const sanitize    = require('../../../bin/sanitizer');
const PF          = constants.PFIELDS;

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.QUESTIONS in options || !(options[PF.QUESTIONS] instanceof Array)) {
    logger.error('addUserQuestions: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  let idList = [];
  
  for(let i = 0; i < options[PF.QUESTIONS].length; i++) {
    idList.push(sanitize(options[PF.QUESTIONS][i]));
  }
  
  db.deleteUserQuestions(idList, function (err) {
    if(err) {
      logger.error('deleteUserQuestions:');
      logger.error(err);
      return next(err);
    }
      
    res.statusCode = 200;
    res.end();
  });
  
};
