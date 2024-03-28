import type { Info } from '@genshin-optimizer/gi/wr'

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
    return { path: key }
  }
}
