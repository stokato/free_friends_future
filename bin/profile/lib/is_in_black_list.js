/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Проверяем, находится ли пользователь с таким ИД в черном списке
 */

module.exports = function (uid) {
  return !!(this._pBlackList[uid]);
};