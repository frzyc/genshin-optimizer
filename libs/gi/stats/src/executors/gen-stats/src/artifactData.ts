import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  artifactIdMap,
  artifactSlotMap,
  getHakushinArtiData,
  reliquaryCodexExcelConfigData,
  reliquarySetExcelConfigData,
} from '@genshin-optimizer/gi/dm'

export type ArtifactDataGen = {
  setNum: number[]
  rarities: number[]
  slots: ArtifactSlotKey[]
}

export default function artifactData() {
  const data = Object.fromEntries(
    Object.entries(reliquarySetExcelConfigData).map(([setid, setData]) => {
      const { setNeedNum } = setData
      const codexInSet = reliquaryCodexExcelConfigData.filter(
        (c) => c.suitId?.toString() === setid
      )
      const slots = [
        ...(codexInSet[0].cupId ? (['goblet'] as ArtifactSlotKey[]) : []),
        ...(codexInSet[0].leatherId ? (['plume'] as ArtifactSlotKey[]) : []),
        ...(codexInSet[0].capId ? (['circlet'] as ArtifactSlotKey[]) : []),
        ...(codexInSet[0].flowerId ? (['flower'] as ArtifactSlotKey[]) : []),
        ...(codexInSet[0].sandId ? (['sands'] as ArtifactSlotKey[]) : []),
      ] as ArtifactSlotKey[]
      const rarities = codexInSet.map((r) => r.level)
      const result: ArtifactDataGen = {
        setNum: setNeedNum,
        rarities,
        slots,
      }
      return [artifactIdMap[setid], result]
    })
  ) as Record<ArtifactSetKey, ArtifactDataGen>
  // for (const key of hakushinArtis) {
  //   data[key] = getDataFromHakushin(key)
  // }
  return data
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDataFromHakushin(key: ArtifactSetKey) {
  const data = getHakushinArtiData(key)

  const stats: ArtifactDataGen = {
    setNum: data.Need,
    rarities: data.Rank,
    slots: Object.keys(data.Parts).map((part) => artifactSlotMap[part]),
  }
  return stats
}
