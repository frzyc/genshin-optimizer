import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { Translate } from '@genshin-optimizer/zzz/i18n'

export function WengineName({ wKey }: { wKey: WengineKey }) {
  return <Translate ns="wengineNames_gen" key18={wKey} />
}

export function WengineRefineDesc({
  wKey,
  phase,
}: {
  wKey: WengineKey
  phase: number
}) {
  return (
    <Translate ns={`wengine_${wKey}_gen`} key18={`phaseDescs.${phase - 1}`} />
  )
}

export function WengineRefineName({
  wKey,
}: {
  wKey: WengineKey
}) {
  return <Translate ns={`wengine_${wKey}_gen`} key18="phase" />
}
