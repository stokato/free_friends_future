// Получить слуайный вопрос
const oPool = require('./../../../objects_pool');

module.exports = function() {
  let rand = Math.floor(Math.random() * oPool.gameQuestions.length);

  return oPool.gameQuestions[rand].text;
};