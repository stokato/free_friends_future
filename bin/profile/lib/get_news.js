//var constants = require('../../io/constants');
/*
 Поулчаем сведения о новых сообщениях, подарках, гостях, дурзьях
 */
module.exports = function() {
  //var f = constants.FIELDS;

  var news = {};
  news.newmessages = this.pNewMessages;
  news.newfriends  = this.pNewFriends;
  news.newguests   = this.pNewGuests;
  news.newgifts    = this.pNewGifts;

  return news;
};