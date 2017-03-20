/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем общую статистику
 *
 */

const logger    = require('../../log')(module);
const stat      = require('../../../bin/stat_controller');
const sanitize  = require('../../../bin/sanitize');
const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
    
    //return res.redirect(path.join(__dirname));
    
    let options = req.body;

    // let minDate = sanitize(options[PF.DATE_FROM]) || null;
    // let maxDate = sanitize(options[PF.DATE_TO]) || null;
    
    let minDate = req.params['first_date'];
    let maxDate = req.params['second_date'];
    
    let pattern = /[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/;
    
    if (!pattern.test(minDate)) {
        minDate = null;
    }
    
    if (!pattern.test(maxDate)) {
        maxDate = null;
    }
    
    stat.getMainStat(minDate, maxDate, (err, st) => {
        if(err) {
            logger.error('getMainStat: ' + err.message);
            return next(err);
        }
        
        let stJSON = JSON.stringify(st);
        
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(stJSON);
    });
};
