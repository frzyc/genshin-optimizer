import { dumpFile, nameToKey } from '@genshin-optimizer/pipeline'
import { objFilterKeys } from '@genshin-optimizer/util'
import { PROJROOT_PATH } from '../../consts'
import type { RelicSetId } from '../../mapping/relic'
import { relicSetIdMap } from '../../mapping/relic'
import { TextMapEN } from '../../TextMapUtil'
import { readDMJSON } from '../../util'
import type { HashId } from '../common'

export type RelicSetConfig = {
  SetID: number
  SetSkillList: number[]
  SetIconPath: string
  SetIconFigurePath: string
  SetName: HashId
  Release: boolean
  IsPlanarSuit?: boolean
}

const relicSetConfigSrc = JSON.parse(
  readDMJSON('ExcelOutput/RelicSetConfig.json')
) as Record<string, RelicSetConfig>

const prePath = `${PROJROOT_PATH}/src/dm/relic/RelicSetConfig`

dumpFile(
  `${prePath}_idmap_gen.json`,
  Object.fromEntries(
    Object.entries(relicSetConfigSrc).map(([setId, data]) => [
      setId,
      nameToKey(TextMapEN[data.SetName.Hash]),
    ])
  )
)
dumpFile(
  `${prePath}_keys_gen.json`,
  [
    ...new Set(
      Object.values(relicSetConfigSrc).map((data) =>
        nameToKey(TextMapEN[data.SetName.Hash])
      )
    ),
  ]
    .filter((s) => s)
    .sort()
)

dumpFile(
  `${prePath}_keys_planar_gen.json`,
  [
    ...new Set(
      Object.values(relicSetConfigSrc)
        .filter((d) => d.IsPlanarSuit)
        .map((data) => nameToKey(TextMapEN[data.SetName.Hash]))
    ),
  ]
    .filter((s) => s)
    .sort()
)

dumpFile(
  `${prePath}_keys_cavern_gen.json`,
  [
    ...new Set(
      Object.values(relicSetConfigSrc)
        .filter((d) => !d.IsPlanarSuit)
        .map((data) => nameToKey(TextMapEN[data.SetName.Hash]))
    ),
  ]
    .filter((s) => s)
    .sort()
)

export const relicSetConfig = objFilterKeys(
  relicSetConfigSrc,
  Object.keys(relicSetIdMap) as RelicSetId[]
) as Record<RelicSetId, RelicSetConfig>
