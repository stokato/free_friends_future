var constants = require('../../io/constants');
/*
 Поулчаем сведения о новых сообщениях, подарках, гостях, дурзьях
 */
module.exports = function() {
  var f = constants.FIELDS;

  var news = {};
  news[f.newmessages] = this.pNewMessages;
  news[f.newfriends]  = this.pNewFriends;
  news[f.newguests]   = this.pNewGuests;
  news[f.newgifts]    = this.pNewGifts;

  return news;
};