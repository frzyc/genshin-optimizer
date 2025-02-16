import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { registerDisc } from '../util'

const key: DiscSetKey = 'FreedomBlues'

const sheet = registerDisc(
  key
  // When an EX Special Attack hits an enemy, reduce the target's Anomaly Buildup RES to the equipper's Attribute by 20% for 8s. This effect does not stack with others of the same attribute.
)
export default sheet
