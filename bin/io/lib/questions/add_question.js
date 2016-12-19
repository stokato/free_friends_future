var db      = require('./../../../db_manager');
var IOF     = require('./../../../constants').PFIELDS;

// Добавить вопрос в БД
module.exports = function (socket, options, callback) {
  
  var params = {};
  params[IOF.TEXT] = options[IOF.TEXT];
  params[IOF.IMAGE_1] = options[IOF.IMAGE_1];
  params[IOF.IMAGE_2] = options[IOF.IMAGE_2];
  params[IOF.IMAGE_3] = options[IOF.IMAGE_3];
  
  db.addQuestion(params, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};

