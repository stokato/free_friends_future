var validator = require('validator');
var GameError = require('./../game_error');

var addAction      = require('./lib/add_action');

var start          = require('./lib/start'),
    stop           = require('./lib/stop'),
    emit           = require('./lib/emit');

var hStart         = require('./lib/handlers/h_start'),
    hLot           = require('./lib/handlers/h_lot'),
    hBottle        = require('./lib/handlers/h_bottle'),
    hBottleKisses  = require('./lib/handlers/h_bottle_kisses'),
    hQuestions     = require('./lib/handlers/h_questions'),
    hCards         = require('./lib/handlers/h_cards'),
    hBest          = require('./lib/handlers/h_best'),
    hSympathy      = require('./lib/handlers/h_sympathy'),
    hSympathyShow  = require('./lib/handlers/h_sympathy_show');

/**
 * ����� ����
 * @param socket
 * @param room
 * @param users
 * @constructor
 * ����� start ��������� ����, ���������� ���������� start, ������� ���� �������� ������� �������� ������
 *       � ��������� �������� ������
 * ����� ���� ��������� �� ������ �������� �������� ���� ���������� �� ������ �������� ������ ����
 * ����� emit ������� ������� ���� � ��������
 * ���� �� ��� ������ ������� ���� ��� �� ������������� �����, ���������� ����������� �������������
 * ����� stop ������������� ���� � ���������� � ���� ������� ����� ���������� � ����
 */
function Game(socket, room, users) {
  var self = this;
  this.userList = users;
  this.gRoom = room;            // ����� ���� ����
  this.gSocket = socket;        // �����
  this.actionsQueue = {};       // ������� �������� �������
  this.currPlayers  = [];       // ������, ������� � ������ ������ ����� ������ �� ����
  this.nextGame = 'start';      // ����, ������� ����� ������� ���������
  this.currTimer = null;        // ������, ������������ ����� �������� �������, ��������� ��������� ����
  this.countActions = 0;        // ���������� �������� �� �������� � ��������� ����

  addAction(self);

  this.handlers = { // ����������� ���
    start         : hStart(self),
    lot           : hLot(self),
    bottle        : hBottle(self),
    bottle_kisses : hBottleKisses(self),
    questions     : hQuestions(self),
    cards         : hCards(self),
    best          : hBest(self),
    sympathy      : hSympathy(self),
    sympathy_show : hSympathyShow(self)
  };
}

Game.prototype.start = start;
Game.prototype.stop = stop;
Game.prototype.emit = emit;

module.exports = Game;
