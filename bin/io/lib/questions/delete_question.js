var db      = require('./../../../db_manager');
var IOF     = require('./../../../constants').PFIELDS;

// Удалить вопрос из БД
module.exports = function (socket, options, callback) {
  
  db.deleteQuestion(options[IOF.ID], function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

