import { discSetNames, type DiscSetKey } from '@genshin-optimizer/zzz/consts'

export function DiscSetName({ setKey }: { setKey: DiscSetKey }) {
  return discSetNames[setKey] ?? setKey
  // TODO: Translation
  // return <Translate ns="discNames_gen" key18={setKey} />
}
