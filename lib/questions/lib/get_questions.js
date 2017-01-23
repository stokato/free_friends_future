/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы из базы
 *
 */

const logger    = require('../../log')(module);
const db        = require('../../../bin/db_manager');
const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  db.findAllQuestions((err, questions) => {
    if(err) {
      logger.error('getQuestions:');
      logger.error(err);
      return next(err);
    }
    
    let resJSON = JSON.stringify({ [PF.QUESTIONS] : questions });
    
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
