/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Обновляем состав вопросов в играх
 */

const logger            = require('../../log')(module);
const questionsCtrlr = require('./../../../bin/questions_controller');

module.exports = function(req, res, next) {
  
  questionsCtrlr.loadQuestions((err) => {
    if(err) {
      logger.error('reloadQuestions:');
      logger.error(err);
      return next(err);
    }
    
    let resJSON = JSON.stringify('{}');
    
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
