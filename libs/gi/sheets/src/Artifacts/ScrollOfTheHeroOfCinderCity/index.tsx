import { objKeyMap, objKeyValMap } from '@genshin-optimizer/common/util'
import {
  allElementKeys,
  type ArtifactSetKey,
} from '@genshin-optimizer/gi/consts'
import type { UIData } from '@genshin-optimizer/gi/uidata'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  infoMut,
  input,
  percent,
  sum,
} from '@genshin-optimizer/gi/wr'
import { condReadNode, nonStackBuff, st, stg } from '../../SheetUtil'
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

// If one of following is true, the element is buffed
const isReactEleBuffed = objKeyMap(allElementKeys, (ele) =>
  greaterEq(
    sum(
      // buffing self elemental damage; check if any reactions are enabled
      equal(input.charEle, ele, greaterEq(reactNodeOnCount, 1, 1)),
      // buffing other elemental damage; check if that conditional is enabled
      equal(condReacts[ele], ele, 1)
    ),
    1,
    1
  )
)

const set4BaseTallyWrites = objKeyValMap(allElementKeys, (ele) => [
  `scroll4base${ele}`,
  greaterEqStr(
    input.artSet[key],
    4,
    greaterEqStr(isReactEleBuffed[ele], 1, input.charKey)
  ),
])

const condReactBuffs = objKeyMap(allElementKeys, (ele) =>
  nonStackBuff(`scroll4base${ele}`, `${ele}_dmg_`, percent(0.12))
)

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

// If one of following is true, the element is buffed
const isNsEleBuffed = objKeyMap(allElementKeys, (ele) =>
  greaterEq(
    sum(
      // buffing self elemental damage; check if any reactions are enabled
      equal(input.charEle, ele, greaterEq(reactAndNightsoulOnCount, 1, 1)),
      // buffing other elemental damage; check if that conditional is enabled
      equal(condNightsouls[ele], ele, equal(condReacts[ele], ele, 1))
    ),
    1,
    1
  )
)

const set4NsTallyWrites = objKeyValMap(allElementKeys, (ele) => [
  `scroll4ns${ele}`,
  greaterEqStr(
    input.artSet[key],
    4,
    equalStr(isNsEleBuffed[ele], 1, input.charKey)
  ),
])

const condNightsoulBuffs = objKeyMap(allElementKeys, (ele) =>
  nonStackBuff(`scroll4ns${ele}`, `${ele}_dmg_`, percent(0.28))
)

const totalBuffs = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  sum(condReactBuffs[ele][0], condNightsoulBuffs[ele][0]),
])

export const data: Data = dataObjForArtifactSheet(key, {
  teamBuff: {
    premod: {
      ...totalBuffs,
    },
    nonStacking: {
      ...set4BaseTallyWrites,
      ...set4NsTallyWrites,
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
          ...Object.entries(condReactBuffs).flatMap(([key, nodes]) =>
            nodes.map((node) => ({
              node: infoMut(node, {
                path: `${key}_dmg_`,
                isTeamBuff: true,
              }),
              // Hide buffs that aren't enabled by conditionals, since we are showing the buffs separately from the checkboxes
              canShow: (data: UIData) =>
                data.get(isReactEleBuffed[key]).value >= 1,
            }))
          ),
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
          ...Object.entries(condNightsoulBuffs).flatMap(([key, nodes]) =>
            nodes.map((node) => ({
              node: infoMut(node, {
                path: `${key}_dmg_`,
                isTeamBuff: true,
              }),
              // Hide buffs that aren't enabled by conditionals, since we are showing the buffs separately from the checkboxes
              canShow: (data: UIData) =>
                data.get(isNsEleBuffed[key]).value >= 1,
            }))
          ),
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
