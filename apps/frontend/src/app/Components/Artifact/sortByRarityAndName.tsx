import i18n from '../../i18n'
import type { ArtifactRarity, ArtifactSetKey } from '../../Types/consts'

export default function sortByRarityAndName(
  a: { key: ArtifactSetKey; grouper: ArtifactRarity },
  b: { key: ArtifactSetKey; grouper: ArtifactRarity }
) {
  if (a.grouper > b.grouper) {
    return -1
  }
  if (a.grouper < b.grouper) {
    return 1
  }

  const aName = i18n.t(`artifactNames_gen:${a.key}`)
  const bName = i18n.t(`artifactNames_gen:${b.key}`)
  if (aName < bName) {
    return -1
  }
  if (aName > bName) {
    return 1
  }

  return 0
}
