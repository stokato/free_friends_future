var db      = require('./../../../db_manager');

// Удалить вопрос из БД
module.exports = function (socket, options, callback) {
  
  db.deleteQuestion(options.id, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

