import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { entriesForWengine, registerWengine } from '../util'

const key: WengineKey = 'SixShooter'

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key)

  // Conditional buffs
  // TODO: daze_
)
export default sheet
