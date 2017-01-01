/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем вопрос в базу данных
 *
 */

var db      = require('./../../db_manager');
var IOF     = require('./../../constants').PFIELDS;

module.exports = function (text, image1, image2, image3, callback) {
  
  var params = {};
  params[IOF.TEXT]    = text;
  params[IOF.IMAGE_1] = image1;
  params[IOF.IMAGE_2] = image2;
  params[IOF.IMAGE_3] = image3;
  params[IOF.FVID]    = this._pVID;
  
  db.addUserQuestion(this._pID, params, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};
