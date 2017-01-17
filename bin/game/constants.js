/**
 * Created by s.t.o.k.a.t.o on 17.01.2017.
 */

const G_START     = 'results',
  G_LOT           = 'lot',
  G_BOTTLE        = 'bottle',
  G_BOTTLE_KISSES = 'bottle_kisses',
  G_QUESTIONS     = 'questions',
  G_CARDS         = 'cards',
  G_BEST          = 'best',
  G_SYMPATHY      = 'sympathy',
  G_SYMPATHY_SHOW = 'sympathy_show',
  G_PRISON        = 'prison';

module.exports.G_START            = G_START;
module.exports.G_LOT              = G_LOT;
module.exports.G_BOTTLE           = G_BOTTLE;
module.exports.G_BOTTLE_KISSES    = G_BOTTLE_KISSES;
module.exports.G_QUESTIONS        = G_QUESTIONS;
module.exports.G_CARDS            = G_CARDS;
module.exports.G_BEST             = G_BEST;
module.exports.G_SYMPATHY         = G_SYMPATHY;
module.exports.G_SYMPATHY_SHOW    = G_SYMPATHY_SHOW;
module.exports.G_PRISON           = G_PRISON;

// Игры с тюрьмой и без
 module.exports.GAMES                  = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY, G_PRISON ];
 module.exports.GAMES_WITHOUT_PRISON   = [ G_BOTTLE, G_QUESTIONS, G_CARDS, G_BEST, G_SYMPATHY ];

// module.exports.GAMES = [ G_PRISON, G_PRISON ];
// module.exports.GAMES_WITHOUT_PRISON = [G_CARDS, G_CARDS];

// Типы обработчиков
module.exports.GT_ST = 'start';
module.exports.GT_ON = 'onpick';
module.exports.GT_FIN = 'finish';
