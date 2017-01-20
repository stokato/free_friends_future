/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 */
// const jsonfile = require('jsonfile'); //
// const path = require('path'); //
// const async = require('async');

const logger    = require('../../log')(module);
const Config    = require('../../../config.json');
const db        = require('../../../bin/db_manager');

const PF        = require('../../../bin/const_fields');
const CONST_TYPE = Config.good_types.gift;

module.exports = function(req, res, next) {
  
  db.findAllGoods(CONST_TYPE, function (err, goods) {
    if(err) {
      logger.error('getCoins:');
      logger.error(err);
      return next(err);
    }
    
    // //
    //  let file = path.resolve(__dirname, 'gifts.json');
    // // jsonfile.writeFile(file, goods, {spaces: 2}, function (err) {
    // //   logger.debug(err);
    // // });
    // //
    // jsonfile.readFile(file, function (err, obj) {
    //   if(err) { return logger.error(err); }
    //
    //   let gifts = [];
    //   for(let item in obj) if(obj.hasOwnProperty(item)) {
    //     gifts.push(obj[item]);
    //   }
    //
    //   async.map(gifts, function (gift, cb) {
    //     let params = {
    //       //[PF.ID]           : sanitize(options[PF.ID]),
    //       [PF.TITLE]        : gift[PF.TITLE],
    //       [PF.PRICE]        : gift[PF.PRICE],
    //       [PF.SRC]          : gift[PF.SRC],
    //       [PF.GROUP]        : gift[PF.GROUP],
    //       [PF.GROUP_TITLE]  : gift[PF.GROUP_TITLE],
    //       [PF.TYPE]         : gift[PF.TYPE],
    //       [PF.RANK]         : gift[PF.RANK] || null,
    //       [PF.LEVEL]        : gift[PF.LEVEL],
    //     };
    //
    //     dbCtrlr.addGood(params, function (err) {
    //       if(err) { return cb(err); }
    //
    //       cb(null, null);
    //     });
    //   }, function (err, res) {
    //     if(err) { return logger.error(err); }
    //
    //     logger.debug('done');
    //   });
    // });
    //
    let resJSON = JSON.stringify({ [PF.CONTENT] : goods });
    
    res.setHeader("Content-Type", "text/json");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
