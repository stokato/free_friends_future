// ���������� ���� � �������� ����� ���������� � ���� � ���� �������
module.exports = function() {
  clearTimeout(this.currTimer);
  
  var guys = this.room.guys;
  var girls = this.room.girls;
  
  var guy, girl;
  for (guy in guys) if(guys.hasOwnProperty(guy)) {
    guys[guy].setReady(false);
  }
  for (girl in girls) if(girls.hasOwnProperty(girl)) {
    girls[girl].setReady(false);
  }
};