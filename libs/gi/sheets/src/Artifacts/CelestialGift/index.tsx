import { objKeyValMap, objMap } from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import {
  active,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  inferInfoMut,
  input,
  mergeData,
  percent,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg } from '../../SheetUtil'
import { ArtifactSheet, setHeaderTemplate } from '../ArtifactSheet'
import type { SetEffectSheet } from '../IArtifactSheet'
import { dataObjForArtifactSheet } from '../dataUtil'

const key: ArtifactSetKey = 'CelestialGift'
const setHeader = setHeaderTemplate(key)

const set2 = greaterEq(input.artSet[key], 2, 0.2)

const [condSet4Path, condSet4] = cond(key, 'set4')
const lightGuidanceWriteObj = objKeyValMap(
  allElementKeys,
  (ele) =>
    [
      `lightGuidance${ele}`,
      greaterEqStr(
        input.artSet[key],
        4,
        equalStr(
          condSet4,
          'on',
          equalStr(
            input.flags.hexerei,
            1,
            equalStr(
              input.charEle,
              ele,
              equalStr(
                input.nonStacking[`mortalHymn${ele}`],
                undefined,
                input.charKey
              )
            )
          )
        )
      ),
    ] as const
)
const lightGuidanceBuffObj = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  nonStackBuff(`lightGuidance${ele}`, `${ele}_dmg_`, percent(0.2)),
])

const mortalHymnWriteObj = objKeyValMap(
  allElementKeys,
  (ele) =>
    [
      `mortalHymn${ele}`,
      greaterEqStr(
        input.artSet[key],
        4,
        equalStr(
          condSet4,
          'on',
          equalStr(
            input.flags.hexerei,
            1,
            greaterEqStr(
              tally.hexerei,
              2,
              greaterEqStr(
                sum(
                  equal(input.charEle, ele, 1),
                  equal(active.charEle, ele, 1)
                ),
                1,
                input.charKey
              )
            )
          )
        )
      ),
    ] as const
)
const mortalHymnBuffObj = objKeyValMap(allElementKeys, (ele) => [
  `${ele}_dmg_`,
  nonStackBuff(`mortalHymn${ele}`, `${ele}_dmg_`, percent(0.4)),
])

export const data: Data = dataObjForArtifactSheet(
  key,
  mergeData(
    [
      {
        premod: {
          enerRech_: set2,
        },
        teamBuff: {
          premod: objMap(lightGuidanceBuffObj, (buff) => buff[0]),
          nonStacking: {
            ...lightGuidanceWriteObj,
            ...mortalHymnWriteObj,
          },
        },
      },
      {
        teamBuff: {
          premod: objMap(mortalHymnBuffObj, (buff) => buff[0]),
        },
      },
    ].map((d) => inferInfoMut(d))
  )
)

const sheet: SetEffectSheet = {
  2: { document: [{ header: setHeader(2), fields: [{ node: set2 }] }] },
  4: {
    document: [
      {
        header: setHeader(4),
        canShow: equal(input.flags.hexerei, 1, 1),
        teamBuff: true,
        path: condSet4Path,
        value: condSet4,
        name: st('afterUse.skill'),
        states: {
          on: {
            fields: [
              ...Object.entries(lightGuidanceBuffObj).flatMap(
                ([key, buffNodes]) =>
                  buffNodes.map((node) => ({
                    node: equal(
                      input.charEle,
                      key.slice(0, key.indexOf('_')),
                      node
                    ),
                  }))
              ),
              ...Object.entries(mortalHymnBuffObj).flatMap(([key, buffNodes]) =>
                buffNodes.map((node) => ({
                  node: greaterEq(
                    sum(
                      equal(input.charEle, key.slice(0, key.indexOf('_')), 1),
                      equal(active.charEle, key.slice(0, key.indexOf('_')), 1)
                    ),
                    1,
                    node
                  ),
                }))
              ),
              {
                text: stg('duration'),
                value: 20,
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
