/**
 * Created by s.t.o.k.a.t.o on 20.12.2016.
 *
 *  Удаляем вопросы из базы
 */

const logger    = require('../../log')(module);
const db        = require('../../../bin/db_controller');
const sanitize  = require('../../../bin/sanitize');
const PF        = require('../../../bin/const_fields');

module.exports = function(req, res, next) {
    
    let options = req.body;
    
    if(!PF.QUESTIONS in options || !(options[PF.QUESTIONS] instanceof Array)) {
        logger.error('addUserQuestions: parameter is not specified');
        
        res.setStatus = 400;
        return res.send({ error : 'parameter is not specified' });
    }
    
    let idList = [];
    
    for(let i = 0; i < options[PF.QUESTIONS].length; i++) {
        idList.push(sanitize(options[PF.QUESTIONS][i]));
    }
    
    db.deleteQuestions(idList, (err) => {
        if(err) {
            logger.error('deleteUserQuestions:');
            logger.error(err);
            return next(err);
        }
        
        let resJSON = JSON.stringify('{}');
        
        res.statusCode = 200;
        res.end(resJSON);
    });
    
};