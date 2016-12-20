/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем в базу подтвержденные вопросы пользователей
 */

var db = require('../../../bin/db_manager');
var constants = require('../../../bin/constants');
var PF = constants.PFIELDS;
var logger    = require('../../log')(module);
var sanitize = require('../../../bin/sanitizer');
var async = require('async');

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
  
  db.findUserQustions(idList, function (err, questions) {
    if(err) {
      logger.error('addUserQuestions: ' + err.message);
      return next(err);
    }
    
    async.eachSeries(questions, function (el, cb) {
      
      var params = {};
      params[PF.TEXT]    = el[PF.TEXT];
      params[PF.IMAGE_1] = el[PF.IMAGE_1];
      params[PF.IMAGE_2] = el[PF.IMAGE_2];
      params[PF.IMAGE_3] = el[PF.IMAGE_3];
  
      db.addQuestion(params, function (err, res) {
        if(err) {
          return cb(err, null);
        }
    
        logger.debug('addUserQuestions: ' + el[PF.TEXT]);
    
        cb(null, null);
      });
    }, function (err) {
      if(err) {
        logger.error('addUserQuestions: ' + err.message);
        return next(err);
      }
  
      res.statusCode = 200;
      res.end();
    })
  });
  
};

