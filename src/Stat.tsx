/**
 * @deprecated
 */
export default class Stat {
  //do not instantiate.
  constructor() {
    if (this instanceof Stat)
      throw Error('A static class cannot be instantiated.');
  }
  static printStat = (statKey, stats, premod = false) => <></>
}
