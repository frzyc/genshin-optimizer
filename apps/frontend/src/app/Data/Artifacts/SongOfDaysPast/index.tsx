import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { constant, greaterEq, lookup, naught } from '../../../Formula/utils'
import { cond, st, stg, trans } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'SongOfDaysPast'
const setHeader = setHeaderTemplate(key)
const [, trm] = trans('artifact', key)

const set2 = greaterEq(input.artSet.SongOfDaysPast, 2, 0.15)

const healingArr = range(1000, 15000, 1000)
const [condHealingPath, condHealing] = cond(key, 'healing')
const healing_dmgInc = greaterEq(
  input.artSet.SongOfDaysPast,
  4,
  lookup(
    condHealing,
    objKeyMap(healingArr, (healAmt) => constant(healAmt * 0.08)),
    naught
  )
)
const normal_dmgInc = { ...healing_dmgInc }
const charged_dmgInc = { ...healing_dmgInc }
const plunging_dmgInc = { ...healing_dmgInc }
const skill_dmgInc = { ...healing_dmgInc }
const burst_dmgInc = { ...healing_dmgInc }

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    heal_: set2,
    normal_dmgInc,
    charged_dmgInc,
    plunging_dmgInc,
    skill_dmgInc,
    burst_dmgInc,
  },
})

const sheet: IArtifactSheet = {
  name: 'Song of Days Past',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          value: condHealing,
          path: condHealingPath,
          name: trm('condName'),
          states: objKeyMap(healingArr, (heal) => ({
            name: `${heal}`,
            fields: [
              {
                node: normal_dmgInc,
              },
              {
                node: charged_dmgInc,
              },
              {
                node: plunging_dmgInc,
              },
              {
                node: skill_dmgInc,
              },
              {
                node: burst_dmgInc,
              },
              {
                text: st('triggerQuota'),
                value: 5,
              },
              {
                text: stg('duration'),
                value: 10,
                unit: 's',
              },
            ],
          })),
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
