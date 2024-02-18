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
  static info(key: string): Partial<Info> {
    const info = {} as Partial<Info>
    info.name = KeyMapLib.get(key)
    info.unit = KeyMapLib.unit(key)
    const variant = KeyMapLib.getVariant(key)
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
