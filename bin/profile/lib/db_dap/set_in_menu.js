var db = require('./../../../db_manager');

/*
    Устанавливаем свойство - есть в меню
 */
module.exports = function(isInMenu, callback) {

  isInMenu = !!isInMenu;

  var self = this;

  var options = {};
  options[db.CONST.ID]      = self._pID;
  options[db.CONST.VID]     = self._pVID;
  options[db.CONST.ISMENU]  = isInMenu;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pIsInMenu = isInMenu;
    
    callback(null, self._pIsInMenu);
  });
};
