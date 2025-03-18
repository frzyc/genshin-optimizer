import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { weaponHasRefinement } from '@genshin-optimizer/gi/stats'

function sheet(weaponKey: WeaponKey) {
  return weaponKey === 'QuantumCatalyst'
    ? `weapon_${weaponKey}`
    : `weapon_${weaponKey}_gen`
}
export function WeaponName({ weaponKey }: { weaponKey: WeaponKey }) {
  return <Translate ns={sheet(weaponKey)} key18={'name'} />
}
export function WeaponDesc({ weaponKey }: { weaponKey: WeaponKey }) {
  return <Translate ns={sheet(weaponKey)} key18={'description'} />
}

export function WeaponPassiveName({ weaponKey }: { weaponKey: WeaponKey }) {
  if (!weaponHasRefinement(weaponKey)) return null
  return <Translate ns={sheet(weaponKey)} key18={'passiveName'} />
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
      ns={sheet(weaponKey)}
      key18={`passiveDescription.${refineIndex}`}
    />
  )
}
