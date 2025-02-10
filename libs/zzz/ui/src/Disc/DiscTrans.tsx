import { type DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { getDiscStat } from '@genshin-optimizer/zzz/stats'
import { TransHack } from '../util/TransHack'
export function DiscSetName({ setKey }: { setKey: DiscSetKey }) {
  return getDiscStat(setKey).name ?? 'Unknown Disc Set Name'
  // TODO: Translation
  // return <Translate ns="discNames_gen" key18={setKey} />
}
export function DiscSet2p({ setKey }: { setKey: DiscSetKey }) {
  return <TransHack text={getDiscStat(setKey).desc2 ?? 'Unknown Disc Set 2p'} />
}

export function DiscSet4p({ setKey }: { setKey: DiscSetKey }) {
  return <TransHack text={getDiscStat(setKey).desc4 ?? 'Unknown Disc Set 4p'} />
}
