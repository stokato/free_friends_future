var constants = require('../../constants');
var db = require('./../../db_manager');
/*
 Сохраняем профиль в БД
 */
module.exports = function(callback) {
 var self = this;

 var options = {};
 options.id          = self.pID;
 options.vid         = self.pVID;
 options.age         = self.pAge;
 options.country     = self.pCountry;
 options.city        = self.pCity;
 options.sex         = self.pSex;
 options.status      = self.pStatus;
 options.points      = self.pPoints;
 options.money       = self.pMoney;
 options.newmessages = self.pNewMessages;
 options.newgifts    = self.pNewGifts;
 options.newfriends  = self.pNewFriends;
 options.newguests   = self.pNewGuests;
 if(self.pGift1) {
   options.gift1     = self.pGift1.gid;
 } else {
   options.gift1      = null;
 }


  db.updateUser(options, function(err, id) {
   if (err) { return callback(err, null); }

   callback(null, id);
 });
};