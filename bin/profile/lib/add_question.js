/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем вопрос в базу данных
 *
 */

const  db      = require('./../../db_manager');
const  IOF     = require('./../../constants').PFIELDS;

module.exports = function (text, image1, image2, image3, callback) {
  
  let  params = {
    [IOF.TEXT]    : text,
    [IOF.IMAGE_1] : image1,
    [IOF.IMAGE_2] : image2,
    [IOF.IMAGE_3] : image3,
    [IOF.FVID]    : this._pVID
  };
  
  db.addUserQuestion(this._pID, params, function (err, res) {
    if(err){ return callback(err); }
    
    return callback(null, res);
  });
  
};
