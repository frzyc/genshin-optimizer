import { KeyMap as KeyMapLib } from '@genshin-optimizer/gi/keymap'
import type { Info } from '../Formula/type'
import StatIcon from './StatIcon'

/**
 * @deprecated use go/gi/keymap
 */
export default class KeyMap {
  //do not instantiate.
  constructor() {
    if (this instanceof KeyMap)
      throw Error('A static class cannot be instantiated.')
  }
  static getStr(key = '') {
    return KeyMapLib.getStr(key)
  }
  static get(key = '') {
    return KeyMapLib.get(key)
  }
  static getVariant(key = '') {
    return KeyMapLib.getVariant(key)
  }
  /**
   * @deprecated use @genshin-optimizer/common/util/numDisplay/unit
   * @param key
   * @returns
   */
  static unit(key = '') {
    return KeyMapLib.unit(key)
  }
  static info(key: string): Partial<Info> {
    const info = {} as Partial<Info>
    info.name = this.get(key)
    info.unit = this.unit(key)
    const variant = this.getVariant(key)
    info.variant = variant
    info.icon = (
      <StatIcon
        statKey={key}
        iconProps={{ fontSize: 'inherit', color: variant }}
      />
    )
    return info
  }
}
