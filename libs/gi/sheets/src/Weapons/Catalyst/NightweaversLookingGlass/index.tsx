import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  equalStr,
  infoMut,
  input,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, nonStackBuff, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'NightweaversLookingGlass'
const [, trm] = trans('weapon', key)

const prayerEleMasArr = [-1, 60, 75, 90, 105, 120]
const verseEleMasArr = [-1, 60, 75, 90, 105, 120]
const bloom_dmg_arr = [-1, 1.2, 1.5, 1.8, 2.1, 2.4]
const hb_burgeon_dmg_arr = [-1, 0.8, 1, 1.2, 1.4, 1.6]
const lb_dmg_arr = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const [condAfterHydroOrDendroPath, condAfterHydroOrDendro] = cond(
  key,
  'afterHydroOrDendro'
)
const prayerEleMas = equal(
  condAfterHydroOrDendro,
  'on',
  subscript(input.weapon.refinement, prayerEleMasArr)
)

const [condAfterLunarBloomPath, condAfterLunarBloom] = cond(
  key,
  'afterLunarBloom'
)
const verseEleMas = equal(
  condAfterLunarBloom,
  'on',
  subscript(input.weapon.refinement, verseEleMasArr)
)

const nonstackWrite = equalStr(
  condAfterHydroOrDendro,
  'on',
  equalStr(condAfterLunarBloom, 'on', input.charKey)
)
const [both_bloom_dmg_, both_bloom_dmg_inactive] = nonStackBuff(
  'nightweaver',
  'bloom_dmg_',
  subscript(input.weapon.refinement, bloom_dmg_arr, { unit: '%' })
)
const [both_hyperbloom_dmg_, both_hyperbloom_dmg_inactive] = nonStackBuff(
  'nightweaver',
  'hyperbloom_dmg_',
  subscript(input.weapon.refinement, hb_burgeon_dmg_arr, { unit: '%' })
)
const [both_burgeon_dmg_, both_burgeon_dmg_inactive] = nonStackBuff(
  'nightweaver',
  'burgeon_dmg_',
  subscript(input.weapon.refinement, hb_burgeon_dmg_arr, { unit: '%' })
)
const [both_lunarbloom_dmg_, both_lunarbloom_dmg_inactive] = nonStackBuff(
  'nightweaver',
  'lunarbloom_dmg_',
  subscript(input.weapon.refinement, lb_dmg_arr, { unit: '%' })
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas: sum(prayerEleMas, verseEleMas),
  },
  teamBuff: {
    nonStacking: {
      nightweaver: nonstackWrite,
    },
    premod: {
      bloom_dmg_: both_bloom_dmg_,
      hyperbloom_dmg_: both_hyperbloom_dmg_,
      burgeon_dmg_: both_burgeon_dmg_,
      lunarbloom_dmg_: both_lunarbloom_dmg_,
    },
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condAfterHydroOrDendro,
      path: condAfterHydroOrDendroPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: trm('prayerCond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(prayerEleMas, { path: 'eleMas' }),
            },
            {
              text: stg('duration'),
              value: 4.5,
              unit: 's',
              fixed: 1,
            },
          ],
        },
      },
    },
    {
      value: condAfterLunarBloom,
      path: condAfterLunarBloomPath,
      teamBuff: true,
      header: headerTemplate(key, st('conditional')),
      name: st('elementalReaction.team.lunarbloom'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(verseEleMas, { path: 'eleMas' }),
            },
            {
              text: stg('duration'),
              value: 10,
              unit: 's',
            },
          ],
        },
      },
    },
    {
      canShow: equal(
        condAfterHydroOrDendro,
        'on',
        equal(condAfterLunarBloom, 'on', 1)
      ),
      teamBuff: true,
      fields: [
        {
          node: both_bloom_dmg_,
        },
        {
          node: both_bloom_dmg_inactive,
        },
        {
          node: both_hyperbloom_dmg_,
        },
        {
          node: both_hyperbloom_dmg_inactive,
        },
        {
          node: both_burgeon_dmg_,
        },
        {
          node: both_burgeon_dmg_inactive,
        },
        {
          node: both_lunarbloom_dmg_,
        },
        {
          node: both_lunarbloom_dmg_inactive,
        },
      ],
    },
  ],
}
export default new WeaponSheet(sheet, data)
