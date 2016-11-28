var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
 Добавляем подарок в БД
 */
module.exports = function(giftMaker, date, gsrc, gid, gtype, gtitle, callback) {
  var self = this;
  
  var options = {};
  options[IOF.ID]      = giftMaker.getID();
  options[IOF.VID]     = giftMaker.getVID();
  options[IOF.SEX]     = giftMaker.getSex();
  options[IOF.BDATE]   = giftMaker.getBDate();
  options[IOF.DATE]    = date;
  options[IOF.SRC]     = gsrc;
  options[IOF.GIFTID]  = gid;
  options[IOF.TYPE]    = gtype;
  options[IOF.TITLE]   = gtitle;

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