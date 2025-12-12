import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  equal,
  greaterEq,
  infoMut,
  input,
  min,
  one,
  percent,
  prod,
  sum,
  tally,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../SheetUtil'
import { CharacterSheet } from '../CharacterSheet'
import type { TalentSheet } from '../ICharacterSheet'
import { charTemplates } from '../charTemplates'
import {
  dataObjForCharacterSheet,
  dmgNode,
  plungingDmgNodes,
} from '../dataUtil'

const key: CharacterKey = 'Durin'
const skillParam_gen = allStats.char.skillParam[key]

const [condLockHomeworkPath, condLockHomework] = cond(key, 'lockHomework')
const lockHomework_hexerei = equal(condLockHomework, 'on', 1)

const ct = charTemplates(key, lockHomework_hexerei)

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    purityDmg: skillParam_gen.skill[s++],
    darkDmg1: skillParam_gen.skill[s++],
    darkDmg2: skillParam_gen.skill[s++],
    darkDmg3: skillParam_gen.skill[s++],
    energyRegen: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    purityDmg1: skillParam_gen.burst[b++],
    purityDmg2: skillParam_gen.burst[b++],
    purityDmg3: skillParam_gen.burst[b++],
    darkDmg1: skillParam_gen.burst[b++],
    darkDmg2: skillParam_gen.burst[b++],
    darkDmg3: skillParam_gen.burst[b++],
    whiteDmg: skillParam_gen.burst[b++],
    decayDmg: skillParam_gen.burst[b++],
    whiteDuration: skillParam_gen.burst[b++][0],
    darkDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    enemyRes_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    vaporize_dmg_: skillParam_gen.passive1[2][0],
    melt_dmg_: skillParam_gen.passive1[3][0],
  },
  passive2: {
    burst_dmg_mult_: skillParam_gen.passive2[0][0],
    max_burst_dmg_mult_: skillParam_gen.passive2[1][0],
    stackGain: skillParam_gen.passive2[2][0],
  },
  lockedPassive: {
    a1Mult_: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    stackGain: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    lightStackConsume: skillParam_gen.constellation1[2],
    lightDmgInc: skillParam_gen.constellation1[3],
    darkStackConsume: skillParam_gen.constellation1[4],
    darkDmgInc: skillParam_gen.constellation1[5],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    buffDuration: skillParam_gen.constellation2[1],
    dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    unknown20: skillParam_gen.constellation4[0],
    chanceNoStacks: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    burst_defIgn_: skillParam_gen.constellation6[0],
    light_defRed_: skillParam_gen.constellation6[1],
    lightDuration: skillParam_gen.constellation6[2],
    dark_defIgn_: skillParam_gen.constellation6[3],
  },
} as const

const [condBurstFormPath, condBurstForm] = cond(key, 'burstForm')

const [condA1WhiteDendroPath, condA1WhiteDendro] = cond(key, 'a1WhiteDendro')
const [condA1WhiteElectroPath, condA1WhiteElectro] = cond(key, 'a1WhiteElectro')
const [condA1WhiteAnemoPath, condA1WhiteAnemo] = cond(key, 'a1WhiteAnemo')
const [condA1WhiteGeoPath, condA1WhiteGeo] = cond(key, 'a1WhiteGeo')
const a1White_pyro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condBurstForm,
    'white',
    greaterEq(
      sum(
        equal(condA1WhiteDendro, 'dendro', 1),
        equal(condA1WhiteElectro, 'electro', 1),
        equal(condA1WhiteAnemo, 'anemo', 1),
        equal(condA1WhiteGeo, 'geo', 1)
      ),
      1,
      -dm.passive1.enemyRes_
    )
  )
)
const a1White_dendro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condBurstForm,
    'white',
    equal(condA1WhiteDendro, 'dendro', -dm.passive1.enemyRes_)
  )
)
const a1White_electro_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condBurstForm,
    'white',
    equal(condA1WhiteElectro, 'electro', -dm.passive1.enemyRes_)
  )
)
const a1White_anemo_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condBurstForm,
    'white',
    equal(condA1WhiteAnemo, 'anemo', -dm.passive1.enemyRes_)
  )
)
const a1White_geo_enemyRes_ = greaterEq(
  input.asc,
  1,
  equal(
    condBurstForm,
    'white',
    equal(condA1WhiteGeo, 'geo', -dm.passive1.enemyRes_)
  )
)

const a1Dark_vaporize_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condBurstForm, 'dark', dm.passive1.vaporize_dmg_)
)
const a1Dark_melt_dmg_ = greaterEq(
  input.asc,
  1,
  equal(condBurstForm, 'dark', dm.passive1.melt_dmg_)
)

const [condA4StackPath, condA4Stack] = cond(key, 'a4Stack')
const a4Stack_burstPeriodic_mult_ = sum(
  one,
  greaterEq(
    input.asc,
    4,
    equal(
      condA4Stack,
      'on',
      min(
        prod(percent(dm.passive2.burst_dmg_mult_), input.total.atk, 1 / 100),
        percent(dm.passive2.max_burst_dmg_mult_)
      )
    )
  )
)

const lockWhite_pyro_enemyRes_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1White_pyro_enemyRes_, dm.lockedPassive.a1Mult_)
  )
)
const lockWhite_dendro_enemyRes_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1White_dendro_enemyRes_, dm.lockedPassive.a1Mult_)
  )
)
const lockWhite_electro_enemyRes_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1White_electro_enemyRes_, dm.lockedPassive.a1Mult_)
  )
)
const lockWhite_anemo_enemyRes_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1White_anemo_enemyRes_, dm.lockedPassive.a1Mult_)
  )
)
const lockWhite_geo_enemyRes_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1White_geo_enemyRes_, dm.lockedPassive.a1Mult_)
  )
)
const lockDark_vaporize_dmg_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1Dark_vaporize_dmg_, dm.lockedPassive.a1Mult_)
  )
)
const lockDark_melt_dmg_ = greaterEq(
  tally.hexerei,
  2,
  equal(
    condLockHomework,
    'on',
    prod(a1Dark_melt_dmg_, dm.lockedPassive.a1Mult_)
  )
)

const [condC1StacksPath, condC1Stacks] = cond(key, 'c1Stacks')
const c1StacksWhite_normal_dmgIncDisp = greaterEq(
  input.constellation,
  1,
  equal(
    condBurstForm,
    'white',
    equal(
      condC1Stacks,
      'on',
      prod(percent(dm.constellation1.lightDmgInc), input.total.atk)
    )
  )
)
const c1StacksWhite_charged_dmgIncDisp = { ...c1StacksWhite_normal_dmgIncDisp }
const c1StacksWhite_plunging_dmgIncDisp = { ...c1StacksWhite_normal_dmgIncDisp }
const c1StacksWhite_skill_dmgIncDisp = { ...c1StacksWhite_normal_dmgIncDisp }
const c1StacksWhite_burst_dmgIncDisp = { ...c1StacksWhite_normal_dmgIncDisp }
const c1StacksWhite_normal_dmgInc = unequal(
  target.charKey,
  key,
  c1StacksWhite_normal_dmgIncDisp
)
const c1StacksWhite_charged_dmgInc = unequal(
  target.charKey,
  key,
  c1StacksWhite_charged_dmgIncDisp
)
const c1StacksWhite_plunging_dmgInc = unequal(
  target.charKey,
  key,
  c1StacksWhite_plunging_dmgIncDisp
)
const c1StacksWhite_skill_dmgInc = unequal(
  target.charKey,
  key,
  c1StacksWhite_skill_dmgIncDisp
)
const c1StacksWhite_burst_dmgInc = unequal(
  target.charKey,
  key,
  c1StacksWhite_burst_dmgIncDisp
)

const c1StacksDark_burst_dmgInc = greaterEq(
  input.constellation,
  1,
  equal(
    condBurstForm,
    'dark',
    equal(
      condC1Stacks,
      'on',
      prod(percent(dm.constellation1.darkDmgInc), input.total.atk)
    )
  )
)

const [condC2AfterBurstPath, condC2AfterBurst] = cond(key, 'c2AfterBurst')
const c2AfterBurst_pyro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2AfterBurst,
    'on',
    greaterEq(
      sum(
        equal(condA1WhiteDendro, 'dendro', 1),
        equal(condA1WhiteElectro, 'electro', 1),
        equal(condA1WhiteAnemo, 'anemo', 1),
        equal(condA1WhiteGeo, 'geo', 1)
      ),
      1,
      dm.constellation2.dmg_
    )
  )
)
const c2AfterBurst_dendro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2AfterBurst,
    'on',
    equal(condA1WhiteDendro, 'dendro', dm.constellation2.dmg_)
  )
)
const c2AfterBurst_electro_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2AfterBurst,
    'on',
    equal(condA1WhiteElectro, 'electro', dm.constellation2.dmg_)
  )
)
const c2AfterBurst_anemo_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2AfterBurst,
    'on',
    equal(condA1WhiteAnemo, 'anemo', dm.constellation2.dmg_)
  )
)
const c2AfterBurst_geo_dmg_ = greaterEq(
  input.constellation,
  2,
  equal(
    condC2AfterBurst,
    'on',
    equal(condA1WhiteGeo, 'geo', dm.constellation2.dmg_)
  )
)

const c4_burst_dmg_ = greaterEq(
  input.constellation,
  4,
  dm.constellation4.burst_dmg_
)

const c6_burst_defIgn_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.burst_defIgn_
)
const [condC6LightBurstHitPath, condC6LightBurstHit] = cond(
  key,
  'c6LightBurstHit'
)
const c6LightBurstHit_defRed_ = greaterEq(
  input.constellation,
  6,
  equal(
    condBurstForm,
    'white',
    equal(condC6LightBurstHit, 'on', dm.constellation6.light_defRed_)
  )
)
const c6_dark_burst_defIgn_ = greaterEq(
  input.constellation,
  6,
  dm.constellation6.dark_defIgn_
)

const lightBurstAddl = {
  premod: {
    enemyDefIgn_: c6_burst_defIgn_,
  },
}
const darkBurstAddl = {
  premod: {
    enemyDefIgn_: sum(c6_burst_defIgn_, c6_dark_burst_defIgn_),
  },
}

const dmgFormulas = {
  normal: Object.fromEntries(
    dm.normal.hitArr.map((arr, i) => [i, dmgNode('atk', arr, 'normal')])
  ),
  charged: {
    dmg: dmgNode('atk', dm.charged.dmg, 'charged'),
  },
  plunging: plungingDmgNodes('atk', dm.plunging),
  skill: {
    purityDmg: dmgNode('atk', dm.skill.purityDmg, 'skill'),
    darkDmg1: dmgNode('atk', dm.skill.darkDmg1, 'skill'),
    darkDmg2: dmgNode('atk', dm.skill.darkDmg2, 'skill'),
    darkDmg3: dmgNode('atk', dm.skill.darkDmg3, 'skill'),
  },
  burst: {
    purityDmg1: dmgNode('atk', dm.burst.purityDmg1, 'burst', lightBurstAddl),
    purityDmg2: dmgNode('atk', dm.burst.purityDmg2, 'burst', lightBurstAddl),
    purityDmg3: dmgNode('atk', dm.burst.purityDmg3, 'burst', lightBurstAddl),
    darkDmg1: dmgNode('atk', dm.burst.darkDmg1, 'burst', darkBurstAddl),
    darkDmg2: dmgNode('atk', dm.burst.darkDmg2, 'burst', darkBurstAddl),
    darkDmg3: dmgNode('atk', dm.burst.darkDmg3, 'burst', darkBurstAddl),
    whiteDmg: dmgNode(
      'atk',
      dm.burst.whiteDmg,
      'burst',
      lightBurstAddl,
      a4Stack_burstPeriodic_mult_
    ),
    decayDmg: dmgNode(
      'atk',
      dm.burst.decayDmg,
      'burst',
      darkBurstAddl,
      a4Stack_burstPeriodic_mult_
    ),
  },
}
const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, dmgFormulas, {
  premod: {
    skillBoost: skillC5,
    burstBoost: burstC3,
    vaporize_dmg_: sum(a1Dark_vaporize_dmg_),
    melt_dmg_: sum(a1Dark_melt_dmg_),
    burst_dmgInc: c1StacksDark_burst_dmgInc,
    burst_dmg_: c4_burst_dmg_,
  },
  teamBuff: {
    premod: {
      pyro_enemyRes_: sum(a1White_pyro_enemyRes_),
      dendro_enemyRes_: sum(a1White_dendro_enemyRes_),
      electro_enemyRes_: sum(a1White_electro_enemyRes_),
      anemo_enemyRes_: sum(a1White_anemo_enemyRes_),
      geo_enemyRes_: sum(a1White_geo_enemyRes_),
      normal_dmgInc: c1StacksWhite_normal_dmgInc,
      charged_dmgInc: c1StacksWhite_charged_dmgInc,
      plunging_dmgInc: c1StacksWhite_plunging_dmgInc,
      skill_dmgInc: c1StacksWhite_skill_dmgInc,
      burst_dmgInc: c1StacksWhite_burst_dmgInc,
      enemyDefRed_: c6LightBurstHit_defRed_,
    },
  },
  isHexerei: lockHomework_hexerei,
})

const sheet: TalentSheet = {
  auto: ct.talentTem('auto', [
    {
      text: ct.chg('auto.fields.normal'),
    },
    {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], {
          name: ct.chg(`auto.skillParams.${i}`),
          multi: i === 2 ? 2 : undefined,
        }),
      })),
    },
    {
      text: ct.chg('auto.fields.charged'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.charged.dmg, {
            name: ct.chg(`auto.skillParams.4`),
          }),
        },
        {
          text: ct.chg('auto.skillParams.5'),
          value: dm.charged.stam,
        },
      ],
    },
    {
      text: ct.chg('auto.fields.plunging'),
    },
    {
      fields: [
        {
          node: infoMut(dmgFormulas.plunging.dmg, {
            name: stg('plunging.dmg'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.low, {
            name: stg('plunging.low'),
          }),
        },
        {
          node: infoMut(dmgFormulas.plunging.high, {
            name: stg('plunging.high'),
          }),
        },
      ],
    },
  ]),

  skill: ct.talentTem('skill', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.skill.purityDmg, {
            name: ct.chg(`skill.skillParams.0`),
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.darkDmg1, {
            name: ct.chg(`skill.skillParams.1`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.darkDmg2, {
            name: ct.chg(`skill.skillParams.1`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.skill.darkDmg3, {
            name: ct.chg(`skill.skillParams.1`),
            textSuffix: '(3)',
          }),
        },
        {
          text: ct.chg('skill.skillParams.2'),
          value: (data) =>
            dm.skill.energyRegen[data.get(input.total.skillIndex).value],
        },
        {
          text: stg('cd'),
          value: dm.skill.cd,
          unit: 's',
        },
      ],
    },
  ]),

  burst: ct.talentTem('burst', [
    {
      fields: [
        {
          node: infoMut(dmgFormulas.burst.purityDmg1, {
            name: ct.chg(`burst.skillParams.0`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.purityDmg2, {
            name: ct.chg(`burst.skillParams.0`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.purityDmg3, {
            name: ct.chg(`burst.skillParams.0`),
            textSuffix: '(3)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.darkDmg1, {
            name: ct.chg(`burst.skillParams.1`),
            textSuffix: '(1)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.darkDmg2, {
            name: ct.chg(`burst.skillParams.1`),
            textSuffix: '(2)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.darkDmg3, {
            name: ct.chg(`burst.skillParams.1`),
            textSuffix: '(3)',
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.whiteDmg, {
            name: ct.chg(`burst.skillParams.2`),
          }),
        },
        {
          node: infoMut(dmgFormulas.burst.decayDmg, {
            name: ct.chg(`burst.skillParams.3`),
          }),
        },
        {
          text: stg('cd'),
          value: dm.burst.cd,
          unit: 's',
        },
        {
          text: stg('energyCost'),
          value: dm.burst.enerCost,
        },
      ],
    },
    ct.condTem('burst', {
      path: condBurstFormPath,
      value: condBurstForm,
      name: ct.ch('burstForm'),
      teamBuff: true,
      states: {
        white: {
          name: ct.ch('whiteForm'),
          fields: [
            {
              text: ct.chg('burst.skillParams.4'),
              value: dm.burst.whiteDuration,
              unit: 's',
            },
          ],
        },
        dark: {
          name: ct.ch('darkForm'),
          fields: [
            {
              text: ct.chg('burst.skillParams.5'),
              value: dm.burst.darkDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),

  passive1: ct.talentTem('passive1', [
    ct.condTem('passive1', {
      canShow: equal(condBurstForm, 'white', 1),
      teamBuff: true,
      states: {
        dendro: {
          path: condA1WhiteDendroPath,
          value: condA1WhiteDendro,
          name: ct.ch('a1Dendro'),
          fields: [],
        },
        electro: {
          path: condA1WhiteElectroPath,
          value: condA1WhiteElectro,
          name: ct.ch('a1Electro'),
          fields: [],
        },
        anemo: {
          path: condA1WhiteAnemoPath,
          value: condA1WhiteAnemo,
          name: ct.ch('a1Anemo'),
          fields: [],
        },
        geo: {
          path: condA1WhiteGeoPath,
          value: condA1WhiteGeo,
          name: ct.ch('a1Geo'),
          fields: [],
        },
      },
    }),
    ct.fieldsTem('passive1', {
      canShow: equal(
        condBurstForm,
        'white',
        greaterEq(
          sum(
            equal(condA1WhiteDendro, 'dendro', 1),
            equal(condA1WhiteElectro, 'electro', 1),
            equal(condA1WhiteAnemo, 'anemo', 1),
            equal(condA1WhiteGeo, 'geo', 1)
          ),
          1,
          1
        )
      ),
      fields: [
        {
          node: infoMut(a1White_pyro_enemyRes_, {
            path: 'pyro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(a1White_dendro_enemyRes_, {
            path: 'dendro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(a1White_electro_enemyRes_, {
            path: 'electro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(a1White_anemo_enemyRes_, {
            path: 'anemo_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(a1White_geo_enemyRes_, {
            path: 'geo_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          text: stg('duration'),
          value: dm.passive1.duration,
          unit: 's',
        },
      ],
    }),
    ct.fieldsTem('passive1', {
      fields: [
        {
          node: infoMut(a1Dark_vaporize_dmg_, { path: 'vaporize_dmg_' }),
        },
        {
          node: infoMut(a1Dark_melt_dmg_, { path: 'melt_dmg_' }),
        },
      ],
    }),
  ]),
  passive2: ct.talentTem('passive2', [
    ct.condTem('passive2', {
      path: condA4StackPath,
      value: condA4Stack,
      name: ct.ch('a4Cond'),
      states: {
        on: {
          fields: [
            {
              node: infoMut(a4Stack_burstPeriodic_mult_, {
                name: ct.ch('burstPeriodic_mult_'),
                pivot: true,
              }),
            },
          ],
        },
      },
    }),
  ]),
  passive3: ct.talentTem('passive3'),
  lockedPassive: ct.talentTem('lockedPassive', [
    ct.condTem('lockedPassive', {
      path: condLockHomeworkPath,
      value: condLockHomework,
      teamBuff: true,
      name: st('hexerei.homeworkDone'),
      states: {
        on: {
          fields: [
            {
              text: st('hexerei.becomeHexerei', {
                val: `$t(charNames_gen:${key})`,
              }),
            },
            {
              text: st('hexerei.talentEnhance'),
            },
          ],
        },
      },
    }),
    ct.headerTem('lockedPassive', {
      teamBuff: true,
      canShow: greaterEq(
        tally.hexerei,
        2,
        greaterEq(
          input.asc,
          1,
          equal(
            condBurstForm,
            'white',
            greaterEq(
              sum(
                equal(condA1WhiteDendro, 'dendro', 1),
                equal(condA1WhiteElectro, 'electro', 1),
                equal(condA1WhiteAnemo, 'anemo', 1),
                equal(condA1WhiteGeo, 'geo', 1)
              ),
              1,
              lockHomework_hexerei
            )
          )
        )
      ),
      fields: [
        {
          node: infoMut(lockWhite_pyro_enemyRes_, {
            path: 'pyro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockWhite_dendro_enemyRes_, {
            path: 'dendro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockWhite_electro_enemyRes_, {
            path: 'electro_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockWhite_anemo_enemyRes_, {
            path: 'anemo_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(lockWhite_geo_enemyRes_, {
            path: 'geo_enemyRes_',
            isTeamBuff: true,
          }),
        },
        {
          text: stg('duration'),
          value: dm.passive1.duration,
          unit: 's',
        },
      ],
    }),
    ct.headerTem('lockedPassive', {
      canShow: greaterEq(
        tally.hexerei,
        2,
        equal(
          condBurstForm,
          'dark',
          equal(condBurstForm, 'dark', lockHomework_hexerei)
        )
      ),
      fields: [
        {
          node: infoMut(lockDark_vaporize_dmg_, { path: 'vaporize_dmg_' }),
        },
        {
          node: infoMut(lockDark_melt_dmg_, { path: 'melt_dmg_' }),
        },
      ],
    }),
  ]),
  constellation1: ct.talentTem('constellation1', [
    ct.condTem('constellation1', {
      path: condC1StacksPath,
      value: condC1Stacks,
      name: ct.ch('c1Cond'),
      teamBuff: true,
      canShow: equal(condBurstForm, 'white', 1),
      states: {
        on: {
          fields: [
            {
              node: infoMut(c1StacksWhite_normal_dmgIncDisp, {
                path: 'normal_dmgInc',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(c1StacksWhite_charged_dmgIncDisp, {
                path: 'charged_dmgInc',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(c1StacksWhite_plunging_dmgIncDisp, {
                path: 'plunging_dmgInc',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(c1StacksWhite_skill_dmgIncDisp, {
                path: 'skill_dmgInc',
                isTeamBuff: true,
              }),
            },
            {
              node: infoMut(c1StacksWhite_burst_dmgIncDisp, {
                path: 'burst_dmgInc',
                isTeamBuff: true,
              }),
            },
          ],
        },
      },
    }),
    ct.condTem('constellation1', {
      path: condC1StacksPath,
      value: condC1Stacks,
      name: ct.ch('c1Cond'),
      teamBuff: true,
      canShow: equal(condBurstForm, 'dark', 1),
      states: {
        on: {
          fields: [
            {
              node: c1StacksDark_burst_dmgInc,
            },
          ],
        },
      },
    }),
  ]),
  constellation2: ct.talentTem('constellation2', [
    ct.condTem('constellation2', {
      path: condC2AfterBurstPath,
      value: condC2AfterBurst,
      teamBuff: true,
      name: st('afterUse.burst'),
      states: {
        on: {
          fields: [],
        },
      },
    }),
    ct.condTem('constellation2', {
      canShow: equal(condC2AfterBurst, 'on', 1),
      teamBuff: true,
      states: {
        dendro: {
          path: condA1WhiteDendroPath,
          value: condA1WhiteDendro,
          name: ct.ch('a1Dendro'),
          fields: [],
        },
        electro: {
          path: condA1WhiteElectroPath,
          value: condA1WhiteElectro,
          name: ct.ch('a1Electro'),
          fields: [],
        },
        anemo: {
          path: condA1WhiteAnemoPath,
          value: condA1WhiteAnemo,
          name: ct.ch('a1Anemo'),
          fields: [],
        },
        geo: {
          path: condA1WhiteGeoPath,
          value: condA1WhiteGeo,
          name: ct.ch('a1Geo'),
          fields: [],
        },
      },
    }),
    ct.fieldsTem('constellation2', {
      teamBuff: true,
      canShow: equal(
        condC2AfterBurst,
        'on',
        greaterEq(
          sum(
            equal(condA1WhiteDendro, 'dendro', 1),
            equal(condA1WhiteElectro, 'electro', 1),
            equal(condA1WhiteAnemo, 'anemo', 1),
            equal(condA1WhiteGeo, 'geo', 1)
          ),
          1,
          1
        )
      ),
      fields: [
        {
          node: infoMut(c2AfterBurst_pyro_dmg_, {
            path: 'pyro_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2AfterBurst_dendro_dmg_, {
            path: 'dendro_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2AfterBurst_electro_dmg_, {
            path: 'electro_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2AfterBurst_anemo_dmg_, {
            path: 'anemo_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          node: infoMut(c2AfterBurst_geo_dmg_, {
            path: 'geo_dmg_',
            isTeamBuff: true,
          }),
        },
        {
          text: stg('duration'),
          value: dm.constellation2.duration,
          unit: 's',
        },
      ],
    }),
  ]),
  constellation3: ct.talentTem('constellation3', [
    { fields: [{ node: burstC3 }] },
  ]),
  constellation4: ct.talentTem('constellation4', [
    {
      fields: [
        {
          node: c4_burst_dmg_,
        },
      ],
    },
  ]),
  constellation5: ct.talentTem('constellation5', [
    { fields: [{ node: skillC5 }] },
  ]),
  constellation6: ct.talentTem('constellation6', [
    ct.fieldsTem('constellation6', {
      fields: [
        {
          node: infoMut(c6_burst_defIgn_, {
            name: ct.ch('burst_defIgn_'),
            unit: '%',
          }),
        },
        {
          node: infoMut(c6_dark_burst_defIgn_, {
            name: ct.ch('dark_burst_defIgn_'),
            unit: '%',
          }),
        },
      ],
    }),
    ct.condTem('constellation6', {
      path: condC6LightBurstHitPath,
      value: condC6LightBurstHit,
      teamBuff: true,
      canShow: equal(condBurstForm, 'white', 1),
      name: st('hitOp.burst'),
      states: {
        on: {
          fields: [
            {
              node: c6LightBurstHit_defRed_,
            },
            {
              text: stg('duration'),
              value: dm.constellation6.lightDuration,
              unit: 's',
            },
          ],
        },
      },
    }),
  ]),
}
export default new CharacterSheet(sheet, data)
