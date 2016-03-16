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

 var options = {};
 options[f.id] = self.pID;
 options[f.vid] = self.pVID;
 options[f.points] = self.pPoints + num;

 self.dbManager.updateUser(options, function(err) {
   if (err) {return callback(err, null); }

   self.pPoints = options[f.points];
   callback(null, self.pPoints);
 });
};