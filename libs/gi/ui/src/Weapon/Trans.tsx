import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '../Translate'

export function WeaponName({ weaponKey }: { weaponKey: WeaponKey }) {
  return <Translate ns={`weapon_${weaponKey}_gen`} key18={`name`} />
}
