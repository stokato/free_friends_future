var constants = require('./../constants_io');

module.exports = function(profile) {
  if(profile.getSex() == constants.GUY) {
    len = 'guys_count';
    sexArr = 'guys';
  }
  else {
    len = 'girls_count';
    sexArr = 'girls';
  }
  return { len : len, sexArr : sexArr };
};