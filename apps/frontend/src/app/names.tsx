import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { Translate } from './Components/Translate'

export function artifactTr(setKey: ArtifactSetKey) {
  return <Translate ns="artifactNames_gen" key18={setKey} />
}
