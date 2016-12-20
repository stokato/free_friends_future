/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Получаем вопросы, добавленные пользователями
 *
 */

var db = require('../../../bin/db_manager');
var constants = require('../../../bin/constants');
var PF = constants.PFIELDS;
var logger    = require('../../log')(module);

module.exports = function(req, res, next) {
  
  db.findUserQustions(null, function (err, questions) {
    if(err) {
      logger.error('getUserQuestions: ' + err.message);
      return next(err);
    }
  
    var result = {};
    result[PF.QUESTIONS] = questions;
    
    var resJSON = JSON.stringify(result);
  
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
