import type { WengineKey } from '@genshin-optimizer/zzz/consts'

import { entriesForWengine, registerWengine } from '../util'

const key: WengineKey = 'VortexArrow'

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key)

  // Conditional buffs
  // TODO: daze
)
export default sheet
