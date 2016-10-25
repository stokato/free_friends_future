var db      = require('./../../../db_manager');

// Добавить вопрос в БД
module.exports = function (socket, options, callback) {
  
  db.addQuestion(options, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

