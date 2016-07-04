// Собрать в массив ИД всех играков в списке
module.exports = function (prisoners) { prisoners = prisoners || {};
  var inPrison = null;

  for(var item in prisoners) if(prisoners.hasOwnProperty(item)) {
    if(prisoners[item]) {
      inPrison = {};
      inPrison.id = prisoners[item].id;
      inPrison.vid = prisoners[item].vid;
    }
  }

  return inPrison;
};