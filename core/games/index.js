var bonus     = require('./bonus'),
    bottle    = require('./bottle'),
    choose    = require('./choose'),
    cooler    = require('./cooler'),
    prison    = require('./prison'),
    questions = require('./questions');
    
var games = {
  bonus    : bonus,
  bottle   : bottle,
  choose   : choose,
  cooler   : cooler,
  prison   : prison,
  questions: questions
};

module.exports = games;