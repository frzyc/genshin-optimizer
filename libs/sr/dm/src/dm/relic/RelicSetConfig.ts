import { dumpFile } from '@genshin-optimizer/common/pipeline'
import {
  nameToKey,
  objFilterKeys,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import { TextMapEN } from '../../TextMapUtil'
import { PROJROOT_PATH } from '../../consts'
import type { RelicSetId } from '../../mapping/relic'
import { relicSetIdMap } from '../../mapping/relic'
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
) as RelicSetConfig[]

const prePath = `${PROJROOT_PATH}/src/dm/relic/RelicSetConfig`

dumpFile(
  `${prePath}_idmap_gen.json`,
  objKeyValMap(relicSetConfigSrc, (config) => [
    config.SetID,
    nameToKey(TextMapEN[config.SetName.Hash]),
  ])
)
dumpFile(
  `${prePath}_keys_gen.json`,
  [
    ...new Set(
      relicSetConfigSrc.map((data) => nameToKey(TextMapEN[data.SetName.Hash]))
    ),
  ]
    .filter((s) => s)
    .sort()
)

dumpFile(
  `${prePath}_keys_planar_gen.json`,
  [
    ...new Set(
      relicSetConfigSrc
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
      relicSetConfigSrc
        .filter((d) => !d.IsPlanarSuit)
        .map((data) => nameToKey(TextMapEN[data.SetName.Hash]))
    ),
  ]
    .filter((s) => s)
    .sort()
)

export const relicSetConfig = objFilterKeys(
  objKeyValMap(relicSetConfigSrc, (config) => [config.SetID, config]),
  Object.keys(relicSetIdMap) as RelicSetId[]
) as Record<RelicSetId, RelicSetConfig>
