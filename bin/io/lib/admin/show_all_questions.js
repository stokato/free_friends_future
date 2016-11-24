var db      = require('./../../../db_manager');

/*
 Получить список вопросов
 */
module.exports = function (socket, callback) {
  
  db.findAllQuestions(function (err, questions) {
    if (err) { return callback(err); }
    
    callback(null, { questions : questions });
  });
  
};

