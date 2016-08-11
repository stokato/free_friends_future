var constants = require('../../constants');
/*
 Устанавливаем свойство - есть в меню
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(isInMenu, callback) {

  isInMenu = !!isInMenu;

  var self = this;

  var options = {};
  options.id = self.pID;
  options.vid = self.pVID;
  options.ismenu = isInMenu;

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pIsInMenu = isInMenu;
    callback(null, self.pIsInMenu);
  });
};
