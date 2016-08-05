
module.exports = function(game) {
  var questions = game.getQuestions();
  var rand = Math.floor(Math.random() * questions.length);

  return questions[rand].text;
};