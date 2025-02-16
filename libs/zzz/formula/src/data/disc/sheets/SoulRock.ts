import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { registerDisc } from '../util'

const key: DiscSetKey = 'SoulRock'

const sheet = registerDisc(
  key
  // Upon receiving an enemy attack and losing HP, the equipper takes 40% less DMG for 2.5s. This effect can trigger once every 15s.
)
export default sheet
