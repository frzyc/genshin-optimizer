import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'SoulRock'

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),
  // Upon receiving an enemy attack and losing HP, the equipper takes 40% less DMG for 2.5s. This effect can trigger once every 15s.
)
export default sheet
