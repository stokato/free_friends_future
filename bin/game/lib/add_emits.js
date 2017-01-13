/**
 * Created by s.t.o.k.a.t.o on 25.11.2016.
 */
const constants  = require('../../constants');
const ioc        = require('./../../io_controller');

const turnGame       = require('./../io/turn_game');
const releasePlayer  = require('./../io/release_player');

// Назначаем эмиты
module.exports = function(socket) {
  
  ioc.setEmit(socket, constants.IO_RELEASE_PLAYER, releasePlayer);
  ioc.setEmit(socket, constants.IO_GAME, turnGame);
};