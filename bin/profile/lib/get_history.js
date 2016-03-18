var constants = require('../../io/constants');
/*
�������� ������� ���������� ���� �� �������� ������ �������
 */
module.exports = function(options, callback) {
  var self = this;
  var f = constants.FIELDS;

  var params = {};
  params.id_list        = [options[f.id]];
  params[f.first_date]  = options[f.first_date];
  params[f.second_date] = options[f.second_date];

  self.dbManager.findMessages(self.pID, params, function(err, messages) {
    if (err) { return callback(err, null); }

    messages = messages || [];
    var history = [];
    var message = {};
    for(var i = 0; i < messages.length; i++) {
      if(messages[i].incoming) { // ���� ��������, ����� ������ ����������� (�������� � ����) � ��������
        message[f.id]      = options[f.id];
        message[f.vid]     = options[f.vid];
        message[f.city]    = options[f.city];
        message[f.country] = options[f.country];
        message[f.sex]     = options[f.sex];
      } else {
        message[f.id]      = self.pID;
        message[f.vid]     = self.pVID;
        message[f.city]    = self.pCity;
        message[f.country] = self.pCountry;
        message[f.sex]     = self.pSex;
      }
      message[f.chat]    = options[f.id];
      message[f.date]    = messages[i].date;
      message[f.text]    = messages[i].text;

      history.push(message);
    }
    callback(null, history);
  });
};