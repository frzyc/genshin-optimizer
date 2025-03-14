import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { equal, greaterEq, input, percent } from '@genshin-optimizer/gi/wr'
import { cond, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'ObsidianCodex'
const [, trm] = trans('artifact', key)
const setHeader = setHeaderTemplate(key)

const [cond2NightsoulBlessingPath, cond2NightsoulBlessing] = cond(
  key,
  '2NightsoulBlessing',
)
const set2_dmg_ = greaterEq(
  input.artSet.ObsidianCodex,
  2,
  equal(cond2NightsoulBlessing, 'on', percent(0.15)),
)

const [cond4NightsoulConsumePath, cond4NightsoulConsume] = cond(
  key,
  '4NightsoulConsume',
)
const set4_critRate_ = greaterEq(
  input.artSet.ObsidianCodex,
  4,
  equal(cond4NightsoulConsume, 'on', percent(0.4)),
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    all_dmg_: set2_dmg_,
    critRate_: set4_critRate_,
  },
})

const sheet: SetEffectSheet = {
  2: {
    document: [
      {
        header: setHeader(2),
        path: cond2NightsoulBlessingPath,
        value: cond2NightsoulBlessing,
        name: trm('cond2Name'),
        states: {
          on: {
            fields: [
              {
                node: set2_dmg_,
              },
            ],
          },
        },
      },
    ],
  },
  4: {
    document: [
      {
        header: setHeader(4),
        path: cond4NightsoulConsumePath,
        value: cond4NightsoulConsume,
        name: trm('cond4Name'),
        states: {
          on: {
            fields: [
              {
                node: set4_critRate_,
              },
              {
                text: stg('duration'),
                value: 6,
                unit: 's',
              },
            ],
          },
        },
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
