import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { Translate } from '@genshin-optimizer/sr/i18n'

export function LightConeName({ lcKey }: { lcKey: LightConeKey }) {
  return <Translate ns="lightConeNames_gen" key18={lcKey} />
}

export function LightConePassiveName({ lcKey }: { lcKey: LightConeKey }) {
  return <Translate ns={`lightCone_${lcKey}_gen`} key18="passive.name" />
}
