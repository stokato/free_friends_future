/**
 *  Устанавливаем признак того - что пользователь добавил игру в меню
 *
 *  Сохраняем в БД
 *
 *  @param ismenu, callback
 *
 *  @return isImMenu
 */

const  db = require('./../../db_manager');
const  IOF = require('./../../const_fields');

module.exports = function(ismenu, callback) {

  ismenu = !!ismenu;

  let  self = this;

  let  options = {
    [IOF.ID]      : self._pID,
    [IOF.VID]     : self._pVID,
    [IOF.ISMENU]  : ismenu
  };

  db.updateUser(options, function(err) {
    if (err) {return callback(err, null); }

    self._pIsInMenu = ismenu;
    
    callback(null, self._pIsInMenu);
  });
  
};
