var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
    Устанавливаем свойство - есть в меню
 */
module.exports = function(isInMenu, callback) {

  isInMenu = !!isInMenu;

  var self = this;

  var options = {};
  options[IOF.ID]      = self._pID;
  options[IOF.VID]     = self._pVID;
  options[IOF.ISMENU]  = isInMenu;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pIsInMenu = isInMenu;
    
    callback(null, self._pIsInMenu);
  });
};
