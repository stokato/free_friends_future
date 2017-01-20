/**
 * Created by s.t.o.k.a.t.o on 12.01.2017.
 * 
 *  Обработчики рауднов игры
 */

const gConst = require('./../constants');

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

let handlersObj =  {
  [gConst.G_BEST]          :
    { [gConst.GT_ST]  : startBest,
      [gConst.GT_ON]  : onBestPick,
      [gConst.GT_FIN] : finishBest
    },
  [gConst.G_BOTTLE]        :
    { [gConst.GT_ST]  : startBottle,
      [gConst.GT_ON]  : onBottlePick,
      [gConst.GT_FIN] : finishBottle
    },
  [gConst.G_BOTTLE_KISSES] :
    { [gConst.GT_ST]  : startBottleKisses,
      [gConst.GT_ON]  : onBottleKissesPick,
      [gConst.GT_FIN] : finishBottleKisses
    },
  [gConst.G_CARDS]         :
    { [gConst.GT_ST]  : startCards,
      [gConst.GT_ON]  : onCardPick,
      [gConst.GT_FIN] : finishCards },
  
  [gConst.G_LOT]           :
    { [gConst.GT_ST]  : startLot,
      [gConst.GT_ON]  : onLotPick,
      [gConst.GT_FIN] : finishLot
    },
  [gConst.G_PAUSE]         :
    { [gConst.GT_ST]  : startPause,
      [gConst.GT_ON]  : onPausePick,
      [gConst.GT_FIN] : finishPause
    },
  [gConst.G_PRISON]        :
    { [gConst.GT_ST]  : startPrison,
      [gConst.GT_ON]  : onPrisonPick,
      [gConst.GT_FIN] : finishPrison
    },
  [gConst.G_QUESTIONS]     :
    { [gConst.GT_ST]  : startQuestions,
      [gConst.GT_ON]  : onQuestionPick,
      [gConst.GT_FIN] : finishQuestions
    },
  [gConst.G_SYMPATHY]      :
    { [gConst.GT_ST]  : startSympathy,
      [gConst.GT_ON]  : onSympathyPick,
      [gConst.GT_FIN] : finishSympathy
    },
  [gConst.G_SYMPATHY_SHOW] :
    { [gConst.GT_ST]  : startSympathyShow,
      [gConst.GT_ON]  : onSympathyShowPick,
      [gConst.GT_FIN] : finishSympathyShow
    }
};

Object.freeze(handlersObj);

module.exports = handlersObj;