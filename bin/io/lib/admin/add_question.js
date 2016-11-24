var db      = require('./../../../db_manager');
var IOF     = require('./../../../constants').PFIELDS;

// Добавить вопрос в БД
module.exports = function (socket, options, callback) {
  
  var params = {};
  params[IOF.TEXT] = options[IOF.TEXT];
  
  db.addQuestion(params, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

