var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
 Добавляем подарок в БД
 */
module.exports = function(giftMaker, date, gsrc, gid, gtype, gtitle, callback) {
  var self = this;
  
  var options = {};
  options[IOF.ID]         = giftMaker.getID();
  options[IOF.ID.VID]     = giftMaker.getVID();
  options[IOF.ID.SEX]     = giftMaker.getSex();
  options[IOF.ID.BDATE]   = giftMaker.getBDate();
  options[IOF.ID.DATE]    = date;
  options[IOF.ID.SRC]     = gsrc;
  options[IOF.ID.GIFTID]  = gid;
  options[IOF.ID.TYPE]    = gtype;
  options[IOF.ID.TITLE]   = gtitle;

  db.addGift(self._pID, options, function(err, result) {
    if (err) { return callback(err, null); }

    self._pGift1     = result;
    self._pGift1Time = date;
    
    self.save(function(err) {
      if (err) { return callback(err, null); }

      callback(null, options);
    });
  });

};