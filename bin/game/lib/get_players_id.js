// ������� � ������ �� ���� ������� � ������
module.exports = function (players) {
  var arr = [];
  for(var i = 0; i < players.length; i++) {
    arr.push(players[i].getID());
  }
  return arr;
};