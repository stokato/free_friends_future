var constants = require('./../constants');

module.exports = function(profile) {
  if(profile.getSex() == constants.GUY) {
    len = 'guys_count';
    sexArr = 'guys';
    counter = 'guys_counter';
  }
  else {
    len = 'girls_count';
    sexArr = 'girls';
    counter = 'girls_counter';
  }
  return { len : len, sexArr : sexArr, counter : counter };
};