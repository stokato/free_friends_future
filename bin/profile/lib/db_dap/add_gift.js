var db = require('./../../../db_manager');
var IOF = require('./../../../constants').PFIELDS;

/*
 Добавляем подарок в БД
 */
module.exports = function(giftMaker, date, gsrc, gid, gtype, gtitle, callback) {
  var self = this;
  
  var options = {};
  options[db.CONST.ID]      = giftMaker.getID();
  options[db.CONST.VID]     = giftMaker.getVID();
  options[db.CONST.SEX]     = giftMaker.getSex();
  options[db.CONST.BDATE]    = giftMaker.getBDay();
  options[db.CONST.DATE]    = date;
  options[db.CONST.SRC]     = gsrc;
  options[db.CONST.GIFTID]  = gid;
  options[db.CONST.TYPE]    = gtype;
  options[db.CONST.TITLE]   = gtitle;

  db.addGift(self._pID, options, function(err, result) {
    if (err) { return callback(err, null); }

    self._pGift1 = result;
    self._pGift1Time = date;
    
    self.save(function(err) {
      if (err) { return callback(err, null); }

      callback(null, options);
    });
  });

};