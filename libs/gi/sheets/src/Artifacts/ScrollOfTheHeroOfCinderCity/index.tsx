import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import {
  allElementKeys,
  type ArtifactSetKey,
} from '@genshin-optimizer/gi/consts'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  compareEq,
  equal,
  greaterEq,
  infoMut,
  input,
  sum,
} from '@genshin-optimizer/gi/wr'
import { condReadNode, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'ScrollOfTheHeroOfCinderCity'
const setHeader = setHeaderTemplate(key)

// Have a checkbox for each elemental reaction
const condReactPaths = objKeyMap(allElementKeys, (ele) => [key, `react_${ele}`])
const condReacts = objKeyMap(allElementKeys, (ele) =>
  condReadNode(condReactPaths[ele])
)

const reactNodeOnCount = sum(
  ...allElementKeys.map((ele) => equal(condReacts[ele], ele, 1))
)

const condReactBuffs = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  greaterEq(
    input.artSet.ScrollOfTheHeroOfCinderCity,
    4,
    compareEq(
      input.charEle,
      ele,
      // buffing self elemental damage, check if any of the reactions are enabled
      greaterEq(reactNodeOnCount, 1, 0.12),
      // buffing other elemental damage, check if that particular conditional is enabled
      equal(condReacts[ele], ele, 0.12)
    )
  ),
])

const condNightsoulPaths = objKeyMap(allElementKeys, (ele) => [
  key,
  `nightsoul_${ele}`,
])
const condNightsouls = objKeyMap(allElementKeys, (ele) =>
  condReadNode(condNightsoulPaths[ele])
)

const reactAndNightsoulOnCount = sum(
  ...allElementKeys.map((ele) =>
    equal(condReacts[ele], ele, equal(condNightsouls[ele], ele, 1))
  )
)

const condNightsoulBuffs = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  greaterEq(
    input.artSet.ScrollOfTheHeroOfCinderCity,
    4,
    compareEq(
      input.charEle,
      ele,
      // buffing self elemental damage, check if any of the reactions are enabled
      greaterEq(reactAndNightsoulOnCount, 1, 0.28),
      // buffing other elemental damage, check if that particular conditional is enabled
      equal(condNightsouls[ele], ele, equal(condReacts[ele], ele, 0.28))
    )
  ),
])

const totalBuffs = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  sum(condReactBuffs[`${ele}_dmg_`], condNightsoulBuffs[`${ele}_dmg_`]),
])

export const data: Data = dataObjForArtifactSheet(key, {
  teamBuff: {
    premod: {
      ...totalBuffs,
    },
  },
})

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2) }] },
  4: {
    document: [
      {
        header: setHeader(4),
        teamBuff: true,
        states: (data: UIData) =>
          objKeyMap(
            // Hide current char ele,
            allElementKeys.filter(
              (ele) => data.get(input.charEle).value !== ele
            ),
            (ele) => ({
              value: condReacts[ele],
              path: condReactPaths[ele],
              name: st(`elementalReaction.${ele}`),
              fields: [],
            })
          ),
      },
      {
        teamBuff: true,
        canShow: reactNodeOnCount,
        fields: [
          ...allElementKeys.map((ele) => ({
            node: infoMut(condReactBuffs[`${ele}_dmg_`], {
              path: `${ele}_dmg_`,
              isTeamBuff: true,
            }),
          })),
          {
            text: stg('duration'),
            value: 15,
            unit: 's',
          },
        ],
      },
      {
        header: setHeader(4),
        teamBuff: true,
        canShow: reactNodeOnCount,
        states: (data: UIData) =>
          objKeyMap(
            // Only show reactions that are already enabled
            allElementKeys.filter((ele) => data.get(condReacts[ele]).value),
            (ele) => ({
              value: condNightsouls[ele],
              path: condNightsoulPaths[ele],
              name: st(`elementalReaction.nightsoul.${ele}`),
              fields: [],
            })
          ),
      },
      {
        teamBuff: true,
        canShow: reactAndNightsoulOnCount,
        fields: [
          ...allElementKeys.map((ele) => ({
            node: infoMut(condNightsoulBuffs[`${ele}_dmg_`], {
              path: `${ele}_dmg_`,
              isTeamBuff: true,
            }),
          })),
          {
            text: stg('duration'),
            value: 20,
            unit: 's',
          },
        ],
      },
    ],
  },
}
export default new ArtifactSheet(sheet, data)
