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
 var options = {
   id : self.pID,
   vid : self.pVID,
   points : self.pPoints + num
 };

 self.dbManager.updateUser(options, function(err) {
   if (err) {return callback(err, null); }

   self.pPoints = options.points;
   callback(null, self.pPoints);
 });
};