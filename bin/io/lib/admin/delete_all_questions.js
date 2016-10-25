var db      = require('./../../../db_manager');

// Удалить все вопросы из БД
module.exports = function (socket, options, callback) {
  
  db.deleteAllQuestions(function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

