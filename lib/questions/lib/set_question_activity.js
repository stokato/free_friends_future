/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу подтвержденные вопросы пользователей
 */

const async     = require('async');

const logger    = require('../../log')(module);
const db        = require('../../../bin/db_manager');
const sanitize  = require('../../../bin/sanitize');

const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.QUESTIONS in options || !(options[PF.QUESTIONS] instanceof Array)) {
    logger.error('addUserQuestions: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  async.eachSeries(options[PF.QUESTIONS], (el, cb) => {
    
    let params = {
      [PF.ID] : sanitize(el[PF.ID]),
      [PF.ACTIVITY] : el[PF.ACTIVITY] || false
    };
    
    db.updateQuestion(params, (err, res) => {
      if(err) {
        return cb(err, null);
      }
      
      cb(null, null);
    });
  }, (err) => {
    if(err) {
      logger.error('updateQuestions:');
      logger.error(err);
      return next(err);
    }
    
    res.statusCode = 200;
    res.end();
  })
    
};

