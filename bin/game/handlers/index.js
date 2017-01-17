/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 * 
 *  Обработчики рауднов игры
 */

const constants = require('./../constants');

const finishBest          = require('./finishers/f_best');
const finishBottle        = require('./finishers/f_bottle');
const finishBottleKisses  = require('./finishers/f_bottle_kisses');
const finishCards         = require('./finishers/f_cards');
const finishLot           = require('./finishers/f_lot');
const finishPause         = require('./finishers/f_pause');
const finishPrison        = require('./finishers/f_prison');
const finishQuestions     = require('./finishers/f_questions');
const finishSympathy      = require('./finishers/f_sympathy');
const finishSympathyShow  = require('./finishers/f_sympathy_show');

const startBest           = require('./starters/s_best');
const startBottle         = require('./starters/s_bottle');
const startBottleKisses   = require('./starters/s_bottle_kisses');
const startCards          = require('./starters/s_cards');
const startLot            = require('./starters/s_lot');
const startPause          = require('./starters/s_pause');
const startPrison         = require('./starters/s_prison');
const startQuestions      = require('./starters/s_questions');
const startSympathy       = require('./starters/s_sympathy');
const startSympathyShow   = require('./starters/s_sympathy_show');

const onBestPick          = require('./pickers/p_best');
const onBottlePick        = require('./pickers/p_bottle');
const onBottleKissesPick  = require('./pickers/p_bottle_kisses');
const onCardPick          = require('./pickers/p_cards');
const onLotPick           = require('./pickers/p_lot');
const onPausePick         = require('./pickers/p_pause');
const onPrisonPick        = require('./pickers/p_prison');
const onQuestionPick      = require('./pickers/p_questions');
const onSympathyPick      = require('./pickers/p_sympathy');
const onSympathyShowPick  = require('./pickers/p_sympathy_show');

module.exports = {
  [constants.G_BEST]          :
    { [constants.GT_ST]  : startBest,
      [constants.GT_ON]  : onBestPick,
      [constants.GT_FIN] : finishBest
    },
  [constants.G_BOTTLE]        :
    { [constants.GT_ST]  : startBottle,
      [constants.GT_ON]  : onBottlePick,
      [constants.GT_FIN] : finishBottle
    },
  [constants.G_BOTTLE_KISSES] :
    { [constants.GT_ST]  : startBottleKisses,
      [constants.GT_ON]  : onBottleKissesPick,
      [constants.GT_FIN] : finishBottleKisses
    },
  [constants.G_CARDS]         :
    { [constants.GT_ST]  : startCards,
      [constants.GT_ON]  : onCardPick,
      [constants.GT_FIN] : finishCards },
  
  [constants.G_LOT]           :
    { [constants.GT_ST]  : startLot,
      [constants.GT_ON]  : onLotPick,
      [constants.GT_FIN] : finishLot
    },
  [constants.G_START]         :
    { [constants.GT_ST]  : startPause,
      [constants.GT_ON]  : onPausePick,
      [constants.GT_FIN] : finishPause
    },
  [constants.G_PRISON]        :
    { [constants.GT_ST]  : startPrison,
      [constants.GT_ON]  : onPrisonPick,
      [constants.GT_FIN] : finishPrison
    },
  [constants.G_QUESTIONS]     :
    { [constants.GT_ST]  : startQuestions,
      [constants.GT_ON]  : onQuestionPick,
      [constants.GT_FIN] : finishQuestions
    },
  [constants.G_SYMPATHY]      :
    { [constants.GT_ST]  : startSympathy,
      [constants.GT_ON]  : onSympathyPick,
      [constants.GT_FIN] : finishSympathy
    },
  [constants.G_SYMPATHY_SHOW] :
    { [constants.GT_ST]  : startSympathyShow,
      [constants.GT_ON]  : onSympathyShowPick,
      [constants.GT_FIN] : finishSympathyShow
    }
};