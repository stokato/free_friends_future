// Получить слуайный вопрос
module.exports = function() {
  let questions = this.getQuestions();
  let rand = Math.floor(Math.random() * questions.length);

  return questions[rand].text;
};