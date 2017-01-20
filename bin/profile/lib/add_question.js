/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 * Добавляем вопрос в базу данных
 *
 */

const  dbCtrlr = require('./../../db_manager');
const  PF      = require('./../../const_fields');

module.exports = function (text, image1, image2, image3, callback) {
  
  let  params = {
    [PF.TEXT]    : text,
    [PF.IMAGE_1] : image1,
    [PF.IMAGE_2] : image2,
    [PF.IMAGE_3] : image3,
    [PF.FVID]    : this._pVID
  };
  
  dbCtrlr.addUserQuestion(this._pID, params, (err, res) => {
    if(err){
      return callback(err);
    }
    
    return callback(null, res);
  });
  
};
