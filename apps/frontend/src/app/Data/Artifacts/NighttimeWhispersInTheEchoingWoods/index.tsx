import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { input } from '../../../Formula'
import type { Data } from '../../../Formula/type'
import { equal, greaterEq, sum } from '../../../Formula/utils'
import KeyMap from '../../../KeyMap'
import { cond, st } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { IArtifactSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'NighttimeWhispersInTheEchoingWoods'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet.NighttimeWhispersInTheEchoingWoods, 2, 0.18)

const [condAfterSkillPath, condAfterSkill] = cond(key, 'afterSkill')
const afterSkill_geo_dmg_ = greaterEq(
  input.artSet.NighttimeWhispersInTheEchoingWoods,
  4,
  equal(condAfterSkill, 'on', 0.2, KeyMap.info('geo_dmg_'))
)

const [condCrystallizePath, condCrystallize] = cond(key, 'crystallize')
const crystallize_geo_dmg_ = greaterEq(
  input.artSet.NighttimeWhispersInTheEchoingWoods,
  4,
  equal(
    condAfterSkill,
    'on',
    equal(condCrystallize, 'on', 0.2 * 1.5, KeyMap.info('geo_dmg_'))
  )
)

export const data: Data = dataObjForArtifactSheet(key, {
  premod: {
    atk_: set2,
    geo_dmg_: sum(afterSkill_geo_dmg_, crystallize_geo_dmg_),
  },
})

const sheet: IArtifactSheet = {
  name: 'Nighttime Whispers In The Echoing Woods',
  rarity: [4, 5],
  setEffects: {
    2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
    4: {
      document: [
        {
          header: setHeader(4),
          value: condAfterSkill,
          path: condAfterSkillPath,
          name: st('hitOp.skill'),
          states: {
            on: {
              fields: [
                {
                  node: afterSkill_geo_dmg_,
                },
              ],
            },
          },
        },
        {
          header: setHeader(4),
          value: condCrystallize,
          path: condCrystallizePath,
          canShow: equal(condAfterSkill, 'on', 1),
          name: st('protectedByShieldCrystal'),
          states: {
            on: {
              fields: [
                {
                  node: crystallize_geo_dmg_,
                },
              ],
            },
          },
        },
      ],
    },
  },
}
export default new ArtifactSheet(key, sheet, data)
