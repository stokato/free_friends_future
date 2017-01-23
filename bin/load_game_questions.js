/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Получаем вопросы из БД
 */


const  db     = require('./db_manager');
const  oPool  = require('./objects_pool');

module.exports =  function(callback) {
    db.findQuestionsActivity(true, (err, questions) => {
      if(err) {
        // logger.error(400, "Ошибка при получении вопросов из базы данных");
        //console.log("Ошибка при получении вопросов из базы данных");
        return callback(err, null);
      }
      
      oPool.gameQuestions = questions;
      
      callback(null, null);
    });
  };