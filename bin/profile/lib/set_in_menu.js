/**
 *  Устанавливаем признак того - что пользователь добавил игру в меню
 *
 *  Сохраняем в БД
 *
 *  @param ismenu, callback
 *
 *  @return isImMenu
 */

var db = require('./../../db_manager');
var IOF = require('./../../constants').PFIELDS;

module.exports = function(ismenu, callback) {

  ismenu = !!ismenu;

  var self = this;

  var options = {};
  options[IOF.ID]      = self._pID;
  options[IOF.VID]     = self._pVID;
  options[IOF.ISMENU]  = ismenu;

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pIsInMenu = ismenu;
    
    callback(null, self._pIsInMenu);
  });
  
};
