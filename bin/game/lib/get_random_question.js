/**
 * Получить слуайный вопрос
 */

const oPool = require('./../../objects_pool');
const PF    = require('./../../const_fields');

module.exports = function() {
  let rand = Math.floor(Math.random() * oPool.gameQuestions.length);

  return oPool.gameQuestions[rand][PF.TEXT];
};