/**
 * Created by s.t.o.k.a.t.o on 11.01.2017.
 *
 * Получаем вопросы из БД
 */


const  db     = require('./db_controller');
const  PF     = require('./const_fields');

let gameQuestions = [];

module.exports.loadQuestions =  function(callback) {
    db.findQuestionsActivity(true, (err, questions) => {
      if(err) {
        // logger.error(400, "Ошибка при получении вопросов из базы данных");
        //console.log("Ошибка при получении вопросов из базы данных");
        return callback(err, null);
      }
      
      gameQuestions = questions;
      
      callback(null, null);
    });
  };

module.exports.getRandomQuestion = function() {
  let rand = Math.floor(Math.random() * gameQuestions.length);
  
  return gameQuestions[rand][PF.TEXT];
};