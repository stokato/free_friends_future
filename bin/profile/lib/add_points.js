var async = require('async');
var constants = require('../../constants');
/*
 Добавляем очки пользователю
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(num, callback) {
  if (!isNumeric(num)) {
    return callback(new Error("Ошибка при добавлении очков пользователю, количество очков задано некорректно"));
  }
  var self = this;
  //var f = constants.FIELDS;
  self.pPoints = self.pPoints || 0;
  var oldPoints = self.pPoints;

  async.waterfall([ ////////////////////////////////////////////////////
    function(cb) { // Обновляем очки пользователя в основной таблице
      var options = {};
      options.id = self.pID;
      options.vid = self.pVID;
      options.points = self.pPoints + num;

      self.dbManager.updateUser(options, function(err) {
        if (err) {return cb(err, null); }

        cb(null, null);
      });
    }, /////////////////////////////////////////////////////////////////
    function(res, cb) { // Добавляем новые данные в таблицу очков
        var options = {};
        options.userid = self.pID;
        options.uservid = self.pVID;
        options.sex = self.pSex;
      //options[f.uid] = self.pID;
      options.points = self.pPoints + num;
      self.dbManager.addPoints(options, function(err) {
        if(err) { return cb(err, null); }

        self.pPoints += num;
        cb(null, null);
      });
    }//////////////////////////////////////////////////////////
  ], function(err, res) { // Обрабатываем ошибки или возвращаем результаты
    if(err) {
      return callback(err, null); }

    callback(null, self.pPoints);
  })
};

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}