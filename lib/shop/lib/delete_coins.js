/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 */

const logger    = require('../../log')(module);
const db        = require('../../../bin/db_controller');
const sanitize  = require('../../../bin/sanitize');
const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
  
  let options = req.body;
  
  if(!PF.ID in options) {
    logger.error('deleteGood: parameter is not specified');
    
    res.setStatus = 400;
    return res.send({ error : 'parameter is not specified' });
  }
  
  
  db.deleteCoins(sanitize(options[PF.ID]), (err) => {
    if(err) {
      logger.error('deleteGood:');
      logger.error(err);
      return next(err);
    }
    
      let resJSON = JSON.stringify('{}');
    
    res.statusCode = 200;
    res.end(resJSON);
  });
  
};
