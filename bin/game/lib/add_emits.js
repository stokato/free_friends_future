/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 */
const Config     = require('./../../../config.json');
const ioc        = require('./../../io_controller');

const turnGame       = require('./../io/turn_game');
const releasePlayer  = require('./../io/release_player');
const protectPlayer  = require('./../io/protect_player');

const EMITS = Config.io.emits;

// Назначаем эмиты
module.exports = function(socket) {
  
  ioc.setEmit(socket, EMITS.IO_RELEASE_PLAYER, releasePlayer);
  ioc.setEmit(socket, EMITS.IO_GAME, turnGame);
  ioc.setEmit(socket, EMITS.IO_PRISON_PROTECT, protectPlayer);
};