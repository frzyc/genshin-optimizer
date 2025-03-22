import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { entriesForWengine, registerWengine } from '../util'

const key: WengineKey = 'IdentityInflection'

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key)
)
export default sheet
