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
  phrase,
}: {
  wKey: WengineKey
  phrase: number
}) {
  return (
    <TransHack
      text={
        getWengineStat(wKey)?.phase[phrase - 1]?.desc ??
        'Unknown Wengine Refine Description'
      }
    />
  )
}

export function WengineRefineName({
  wKey,
  phrase,
}: {
  wKey: WengineKey
  phrase: number
}) {
  return (
    getWengineStat(wKey)?.phase[phrase - 1]?.name ??
    'Unknown Wengine Refine Name'
  )
}
