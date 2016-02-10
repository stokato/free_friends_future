/*
 Поулчаем сведения о новых сообщениях, подарках, гостях, дурзьях
 */
module.exports = function() {
    return {
        messages : this.pNewMessages,
        gifts    : this.pNewGifts,
        friends  : this.pNewFriends,
        guests   : this.pNewGuests
    };

};