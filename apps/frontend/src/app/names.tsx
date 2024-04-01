import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/ui'

export function artifactTr(setKey: ArtifactSetKey) {
  return <Translate ns="artifactNames_gen" key18={setKey} />
}
