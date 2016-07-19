var constants = require('../../io/constants');
/*
 Устанавливаем свойство - есть в меню
 - Сначала в БД и если успешно
 - В ОЗУ
 - Возвращаем
 */
module.exports = function(isInMenu, callback) {

  isInMenu = !!isInMenu;

  var self = this;

  var f = constants.FIELDS;

  var options = {};
  options[f.id] = self.pID;
  options[f.vid] = self.pVID;
  options[f.is_in_menu] = isInMenu;

  self.dbManager.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self.pIsInMenu = isInMenu;
    callback(null, self.pIsInMenu);
  });
};
