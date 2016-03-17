var constants = require('../../io/constants');
/*
 Сохраняем профиль в БД
 */
module.exports = function(callback) {
 var self = this;
 var f = constants.FIELDS;

 var options = {};
 options[f.id]          = self.pID;
 options[f.vid]         = self.pVID;
 options[f.age]         = self.pAge;
 options[f.country]     = self.pCountry;
 options[f.city]        = self.pCity;
 options[f.sex]         = self.pSex;
 options[f.status]      = self.pStatus;
 options[f.points]      = self.pPoints;
 options[f.money]       = self.pMoney;
 options[f.newmessages] = self.pNewMessages;
 options[f.newgifts]    = self.pNewGifts;
 options[f.newfriends]  = self.pNewFriends;
 options[f.newguests]   = self.pNewGuests;

  self.dbManager.updateUser(options, function(err, id) {
   if (err) { return callback(err, null); }

   callback(null, id);
 });
};