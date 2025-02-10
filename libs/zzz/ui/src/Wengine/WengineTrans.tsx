import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import { TransHack } from '../util/TransHack'
export function WengineName({ wKey }: { wKey: WengineKey }) {
  return getWengineStat(wKey)?.name ?? 'Unknown Wengine Name'
  // TODO: Translation
  // return <Translate ns="discNames_gen" key18={setKey} />
}

export function WengineRefineDesc({
  wKey,
  refinment,
}: {
  wKey: WengineKey
  refinment: number
}) {
  return (
    <TransHack
      text={
        getWengineStat(wKey)?.refinement[refinment - 1]?.desc ??
        'Unknown Wengine Refine Description'
      }
    />
  )
}

export function WengineRefineName({
  wKey,
  refinment,
}: {
  wKey: WengineKey
  refinment: number
}) {
  return (
    getWengineStat(wKey)?.refinement[refinment - 1]?.name ??
    'Unknown Wengine Refine Name'
  )
}
