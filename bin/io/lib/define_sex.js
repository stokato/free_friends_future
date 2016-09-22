var constants = require('./../../constants');

module.exports = function(profile) {
  var len, sexArr, indexes;
  
  if(profile.getSex() == constants.GUY) {
    len = 'guys_count';
    sexArr = 'guys';
    indexes = 'guys_indexes';
  }
  else {
    len = 'girls_count';
    sexArr = 'girls';
    indexes = 'girls_indexes';
  }
  return { len : len, sexArr : sexArr, indexes : indexes };
};