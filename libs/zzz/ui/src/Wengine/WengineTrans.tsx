import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import { TransHack } from '../util/TransHack'
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
    <TransHack
      text={
        getWengineStat(wKey)?.phase[phase - 1]?.desc ??
        'Unknown Wengine Refine Description'
      }
    />
  )
}

export function WengineRefineName({
  wKey,
  phase,
}: {
  wKey: WengineKey
  phase: number
}) {
  return (
    getWengineStat(wKey)?.phase[phase - 1]?.name ??
    'Unknown Wengine Refine Name'
  )
}
