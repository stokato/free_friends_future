/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы, добавленные пользователями
 *
 */

const db        = require('../../../bin/db_controller');
const PF        = require('../../../bin/const_fields');
const logger    = require('../../log')(module);

module.exports = function(req, res, next) {
  
  db.findUserQuestions(null, (err, questions) => {
    if(err) {
      logger.error('getUserQuestions:');
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
