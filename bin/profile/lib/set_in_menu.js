/**
 *  Устанавливаем признак того - что пользователь добавил игру в меню
 *
 *  Сохраняем в БД
 *
 *  @param ismenu, callback
 *
 *  @return isImMenu
 */

const  dbCtrlr = require('./../../db_manager');
const  PF      = require('./../../const_fields');

module.exports = function(ismenu, callback) {

  ismenu = !!ismenu;

  let  self = this;

  let  options = {
    [PF.ID]      : self._pID,
    [PF.VID]     : self._pVID,
    [PF.ISMENU]  : ismenu
  };

  dbCtrlr.updateUser(options, (err) => {
    if (err) {
      return callback(err, null);
    }

    self._pIsInMenu = ismenu;
    
    callback(null, self._pIsInMenu);
  });
  
};
