// Получить слуайный вопрос
module.exports = function() {
  var questions = this.getQuestions();
  var rand = Math.floor(Math.random() * questions.length);

  return questions[rand].text;
};