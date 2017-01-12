/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 * 
 *  Обработчики рауднов игры
 */

const constants = require('./../../../constants');

const finishBest      = require('./finishers/f_best');
const finishBottle    = require('./finishers/f_bottle');
const finishBottleKisses = require('./finishers/f_bottle_kisses');
const finishCards     = require('./finishers/f_cards');
const finishLot       = require('./finishers/f_lot');
const finishPause     = require('./finishers/f_pause');
const finishPrison    = require('./finishers/f_prison');
const finishQuestions = require('./finishers/f_questions');
const finishSympathy  = require('./finishers/f_sympathy');
const finishSympathyShow = require('./finishers/f_sympathy_show');

const startBest       = require('./starters/s_best');
const startBottle     = require('./starters/s_bottle');
const startBottleKisses = require('./starters/s_bottle_kisses');
const startCards      = require('./starters/s_cards');
const startLot        = require('./starters/s_lot');
const startPause      = require('./starters/s_pause');
const startPrison     = require('./starters/s_prison');
const startQuestions  = require('./starters/s_questions');
const startSympathy   = require('./starters/s_sympathy');
const startSympathyShow = require('./starters/s_sympathy_show');

module.exports = {
  [constants.G_BEST] : { start : startBest, finish : finishBest },
  [constants.G_BOTTLE] : { start : startBottle, finish : finishBottle },
  [constants.G_BOTTLE_KISSES] : { start : startBottleKisses, finish : finishBottleKisses },
  [constants.G_CARDS] : { start : startCards, finish : finishCards },
};