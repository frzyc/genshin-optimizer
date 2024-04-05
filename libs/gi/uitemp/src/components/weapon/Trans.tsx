import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { weaponHasRefinement } from '@genshin-optimizer/gi/stats'
import { Translate } from '@genshin-optimizer/gi/i18n'

export function WeaponName({ weaponKey }: { weaponKey: WeaponKey }) {
  return <Translate ns={`weapon_${weaponKey}_gen`} key18={`name`} />
}
export function WeaponDesc({ weaponKey }: { weaponKey: WeaponKey }) {
  return <Translate ns={`weapon_${weaponKey}_gen`} key18={`description`} />
}

export function WeaponPassiveName({ weaponKey }: { weaponKey: WeaponKey }) {
  if (!weaponHasRefinement(weaponKey)) return null
  return <Translate ns={`weapon_${weaponKey}_gen`} key18={`passiveName`} />
}

export function WeaponPassiveDesc({
  weaponKey,
  refineIndex,
}: {
  weaponKey: WeaponKey
  refineIndex: number
}) {
  if (!weaponHasRefinement(weaponKey)) return null
  return (
    <Translate
      ns={`weapon_${weaponKey}_gen`}
      key18={`passiveDescription.${refineIndex}`}
    />
  )
}
