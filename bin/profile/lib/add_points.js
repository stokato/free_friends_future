var async = require('async');
var constants = require('../../io/constants');
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
  var f = constants.FIELDS;
  self.pPoints = self.pPoints || 0;

  async.waterfall([ ////////////////////////////////////////////////////
    function(cb) { // Обновляем очки пользователя в основной таблице
      var options = {};
      options[f.id] = self.pID;
      options[f.vid] = self.pVID;
      options[f.points] = self.pPoints + num;

      self.dbManager.updateUser(options, function(err) {
        if (err) {return cb(err, null); }

        cb(null, null);
      });
    },////////////////////////////////////////////////////////////////////
    function(res, cb) { // Удаляем старые данные по пользователю из таблице очков
      var options = {};
      options[f.userid] = self.pID;
      options[f.uservid] = self.pVID;
      options[f.points] = self.pPoints;
      self.dbManager.deletePoints(options, function(err) {
        if(err) { return cb(err, null); }

        self.pPoints += num;
        cb(null, options);
      });
    }, //////////////////////////////////////////////////////////////////////
    function(options, cb) { // Добавляем новые данные в таблицу очков
      options[f.points] = self.pPoints;
      self.dbManager.addPoints(options, function(err) {
        if(err) { return cb(err, null); }

        cb(null, null);
      });
    }//////////////////////////////////////////////////////////
  ], function(err, res) { // Обрабатываем ошибки или возвращаем результаты
    if(err) { return callback(err, null); }

    callback(null, self.pPoints);
  })
};

function isNumeric(n) { // Проверка - явлеется ли аргумент числом
  return !isNaN(parseFloat(n)) && isFinite(n);
}