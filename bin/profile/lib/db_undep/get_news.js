/*
    Поулчаем сведения о новых сообщениях, подарках, гостях, дурзьях
 */

module.exports = function() {
  
  return {
    newmessages : this._pIsNewMessages,
    newfriends  : this._pIsNewFriends,
    newguests   : this._pIsNewGuests,
    newgifts    : this._pIsNewGifts
  };
};