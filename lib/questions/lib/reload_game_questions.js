/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Обновляем состав вопросов в играх
 */

const logger            = require('../../log')(module);
const loadGameQuestions = require('./../../../bin/load_game_questions');

module.exports = function(req, res, next) {
  
  loadGameQuestions((err) => {
    if(err) {
      logger.error('reloadQuestions:');
      logger.error(err);
      return next(err);
    }
    
    res.statusCode = 200;
    res.end();
  });
  
};
