/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу подтвержденные вопросы пользователей
 */

const async     = require('async');

const logger    = require('../../log')(module);
const constants = require('../../../bin/constants');
const db        = require('../../../bin/db_manager');
const sanitize  = require('../../../bin/sanitizer');

const PF        = constants.PFIELDS;

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
  
  db.findUserQuestions(idList, function (err, questions) {
    if(err) {
      logger.error('addUserQuestions: ' + err.message);
      return next(err);
    }
    
    async.eachSeries(questions, function (el, cb) {
      
      let params = {
        [PF.TEXT]     : el[PF.TEXT],
        [PF.IMAGE_1]  : el[PF.IMAGE_1],
        [PF.IMAGE_2]  : el[PF.IMAGE_2],
        [PF.IMAGE_3]  : el[PF.IMAGE_3],
        [PF.ACTIVITY] : el[PF.ACTIVITY]
      };

  
      db.addQuestion(params, function (err, res) {
        if(err) { return cb(err, null); }
    
        logger.debug('addUserQuestions: ' + el[PF.TEXT]);
    
        cb(null, null);
      });
    }, function (err) {
      if(err) {
        logger.error('addUserQuestions:');
        logger.error(err);
        return next(err);
      }
  
      res.statusCode = 200;
      res.end();
    })
  });
  
};

