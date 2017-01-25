/**
 * Created by s.t.o.k.a.t.o on 22.12.2016.
 *
 * Контроллер рангов пользователей одной комнаты
 *
 */

const Config = require('./../../config.json');

const addProfile          = require('./lib/add_profile');
const deleteProfile       = require('./lib/delete_profile');
const addRankBall         = require('./lib/add_rank_ball');
const onGetRanksOfProfile = require('./lib/on_get_ranks_of_profile');
const awardProfile        = require('./lib/award_profile');
const takeBonus           = require('./lib/take_bonus');
const emitAddBall         = require('./lib/emit_add_ball');
const onPopularBonus      = require('./lib/on_popular_bonus');
const onReleaserBonus     = require('./lib/on_releaser_bonus');
const onNewRank           = require('./lib/on_new_rank');
const onGetActiveRank     = require('./lib/on_get_active_rank');
const onSetActiveRank     = require('./lib/on_set_active_rank');
const addEmits            = require('./lib/add_emits');
const deleteEmits         = require('./lib/delete_emits');
const checkAlmgihty       = require('./lib/check_almighty');

function RanksManager() {
  
  const RANKS         = Config.ranks;
  const POPULAR_RANK  = RANKS.popular.name;
  const RELEASER_RANK = RANKS.releaser.name;
  const ALMIGHTY      = Config.almighty;
  
  // Обладатели званий
  this._rRankOwners = {};
  
  // Накопленные бонусы по каждому званию
  this._rBonuses = {};
  
  for(let item in RANKS) if(RANKS.hasOwnProperty(item)) {
    let rank = RANKS[item].name;
    this._rRankOwners[rank] = null;
    this._rBonuses[rank] = 0;
  }

  this._rRankOwners[ALMIGHTY] = null;
  
  // Список пользователей со счетчиками званий
  this._rProfiles = {};
  
  // Обработчики для начисления бонусов по каждому званию
  this._onRankBonus = {
    // [POPULAR_RANK]  : onPopularBonus(this),
    [RELEASER_RANK] : onReleaserBonus(this)
  };
  
  this._rankTimers = {}; // Таймеры званий { uid : { rank : } }

}

RanksManager.prototype.getRankOwner   = function (rank) { return this._rRankOwners[rank]; };

RanksManager.prototype.addProfile           = addProfile;
RanksManager.prototype.deleteProfile        = deleteProfile;
RanksManager.prototype.addRankBall          = addRankBall;
RanksManager.prototype.awardProfile         = awardProfile;
RanksManager.prototype.takeBonus            = takeBonus;
RanksManager.prototype.onNewRank            = onNewRank;
RanksManager.prototype.onGetRanksOfProfile  = onGetRanksOfProfile;
RanksManager.prototype.onGetActiveRank      = onGetActiveRank;
RanksManager.prototype.onSetActiveRank      = onSetActiveRank;
RanksManager.prototype.emitAddBall          = emitAddBall;
RanksManager.prototype.addEmits             = addEmits;
RanksManager.prototype.deleteEmits          = deleteEmits;
RanksManager.prototype.checkAlmighty        = checkAlmgihty;

module.exports = RanksManager;