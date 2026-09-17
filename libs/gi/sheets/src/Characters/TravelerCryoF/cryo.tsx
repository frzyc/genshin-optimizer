import { ColorText } from '@genshin-optimizer/common/ui'
import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import {
  allStellarReactionKeys,
  type CharacterKey,
  type CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import {
  constant,
  equal,
  equalStr,
  greaterEq,
  greaterEqStr,
  inferInfoMut,
  infoMut,
  input,
  lookup,
  min,
  naught,
  percent,
  prod,
  stellarDmgNode,
  subscript,
  sum,
  target,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../SheetUtil'
import { charTemplates } from '../charTemplates'
import {
  customDmgNode,
  dataObjForCharacterSheet,
  dmgNode,
  hitEle,
} from '../dataUtil'
import type { TalentSheet } from '../ICharacterSheet'

export default function cryo(
  key: CharacterSheetKey,
  charKey: CharacterKey,
  dmgForms: { [key: string]: DisplaySub }
) {
  const condCharKey = 'TravelerCryo'
  const [, ch] = trans('char', condCharKey)
  const ct = charTemplates(key)

  const skillParam_gen = allStats.char.skillParam[key]
  let s = 0,
    b = 0
  const dm = {
    charged: {
      dmg1: skillParam_gen.auto[5],
      dmg2: skillParam_gen.auto[6],
    },
    skill: {
      skillDmg: skillParam_gen.skill[s++],
      crystalDmg: skillParam_gen.skill[s++],
      cd: skillParam_gen.skill[s++][0],
      starDuration: skillParam_gen.skill[s++][0],
    },
    burst: {
      javelinDmg: skillParam_gen.burst[b++],
      frostglowMult_: skillParam_gen.burst[b++],
      numStrikes: skillParam_gen.burst[b++][0],
      addlStrikes: skillParam_gen.burst[b++][0],
      maxFrostglow: skillParam_gen.burst[b++][0],
      cd: skillParam_gen.burst[b++][0],
      enerCost: skillParam_gen.burst[b++][0],
      javelinStellarconductDmg: skillParam_gen.burst[b++],
      frostglowStellarconductMult_: skillParam_gen.burst[b++],
      javelinStellarswirlDmg: skillParam_gen.burst[b++],
      frostglowStellarswirlMult_: skillParam_gen.burst[b++],
    },
    passive1: {
      addlDmg: skillParam_gen.passive1[0][0],
    },
    passive2: {
      eleMas: skillParam_gen.passive2[0][0],
      maxEleMas: skillParam_gen.passive2[1][0],
    },
    passive3: {
      base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
      maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
      base_stellarswirl_dmg_: skillParam_gen.passive3![2][0],
      maxBase_stellarswirl_dmg_: skillParam_gen.passive3![3][0],
    },
    lockedPassive: {
      charged_dmgInc: skillParam_gen.lockedPassive![7][0],
      cd: skillParam_gen.lockedPassive![8][0],
    },
    constellation1: {
      energyRegen: skillParam_gen.constellation1[0],
      cd: skillParam_gen.constellation1[1],
    },
    constellation2: {
      eleMas: skillParam_gen.constellation2[0],
      duration: skillParam_gen.constellation2[1],
      mult: skillParam_gen.constellation2[2],
    },
    constellation4: {
      durationInc_: skillParam_gen.constellation4[0],
    },
    constellation6: {
      stellar_dmg_: skillParam_gen.constellation6[0],
      duration: skillParam_gen.constellation6[1],
    },
  } as const

  const a0_stellarconduct_baseDmg_ = min(
    prod(percent(dm.passive3.base_stellarconduct_dmg_), input.total.atk),
    percent(dm.passive3.maxBase_stellarconduct_dmg_)
  )
  const a0_stellarswirl_baseDmg_ = min(
    prod(percent(dm.passive3.base_stellarswirl_dmg_), input.total.atk),
    percent(dm.passive3.maxBase_stellarswirl_dmg_)
  )

  const [condA0StellarRadiancePath, condA0StellarRadiance] = cond(
    condCharKey,
    'a0StellarRadiance'
  )

  const [, condLockedPassive] = cond('Traveler', 'lockedPassive')
  const lockedPassive_charged_dmgInc = infoMut(
    equal(
      condLockedPassive,
      'on',
      equal(
        condA0StellarRadiance,
        undefined,
        prod(percent(dm.lockedPassive.charged_dmgInc), input.total.atk)
      )
    ),
    { path: 'charged_dmgInc' }
  )

  const frostglowArr = range(1, dm.burst.maxFrostglow)
  const [condBurstFrostglowPath, condBurstFrostglow] = cond(
    condCharKey,
    'burstFrostglow'
  )
  const burstFrostglow = lookup(
    condBurstFrostglow,
    objKeyMap(frostglowArr, (stack) => constant(stack)),
    naught
  )
  const burstFrostglow_javelin_addlMult_ = equal(
    condA0StellarRadiance,
    undefined,
    prod(
      subscript(input.total.burstIndex, dm.burst.frostglowMult_, { unit: '%' }),
      burstFrostglow
    )
  )
  const burstFrostglow_javelinStellarconduct_addlMult_ = equal(
    condA0StellarRadiance,
    'sc',
    prod(
      subscript(input.total.burstIndex, dm.burst.frostglowStellarconductMult_, {
        unit: '%',
      }),
      burstFrostglow
    )
  )
  const burstFrostglow_javelinStellarswirl_addlMult_ = equal(
    condA0StellarRadiance,
    'ss',
    prod(
      subscript(input.total.burstIndex, dm.burst.frostglowStellarswirlMult_, {
        unit: '%',
      }),
      burstFrostglow
    )
  )

  const [condA1ScStarPath, condA1ScStar] = cond(condCharKey, 'a1ScStar')
  const a1ScStar_infusion = greaterEqStr(
    input.asc,
    1,
    equalStr(condA0StellarRadiance, 'sc', equalStr(condA1ScStar, 'on', 'cryo'))
  )
  const a1ScStar_normal_dmgInc = greaterEq(
    input.asc,
    1,
    equal(
      condA0StellarRadiance,
      'sc',
      equal(
        condA1ScStar,
        'on',
        prod(percent(dm.passive1.addlDmg), input.total.atk)
      )
    )
  )
  const a1ScStar_charged_dmgInc = { ...a1ScStar_normal_dmgInc }
  const a1ScStar_plunging_dmgInc = { ...a1ScStar_normal_dmgInc }

  const a4_eleMas = greaterEq(
    input.asc,
    4,
    min(
      prod(percent(dm.passive2.eleMas), input.premod.atk),
      dm.passive2.maxEleMas
    )
  )

  const [condC2CrystalPath, condC2Crystal] = cond(condCharKey, 'c2Crystal')
  const [condC2ActiveStellarPath, condC2ActiveStellar] = cond(
    condCharKey,
    'c2ActiveStellar'
  )
  const c2Crystal_eleMas_disp = infoMut(
    greaterEq(
      input.constellation,
      2,
      equal(condC2Crystal, 'on', dm.constellation2.eleMas)
    ),
    { path: 'eleMas', isTeamBuff: true }
  )
  const c2Crystal_eleMas = equal(
    input.activeCharKey,
    target.charKey,
    c2Crystal_eleMas_disp
  )
  const c2ActiveStellar_eleMas_disp = infoMut(
    greaterEq(
      input.constellation,
      2,
      equal(
        condC2Crystal,
        'on',
        equal(condC2ActiveStellar, 'on', dm.constellation2.eleMas)
      )
    ),
    { path: 'eleMas', isTeamBuff: true }
  )
  const c2ActiveStellar_eleMas = equal(
    input.activeCharKey,
    target.charKey,
    c2ActiveStellar_eleMas_disp
  )

  const c6Frostglow_stellar_dmg_disp = greaterEq(
    input.constellation,
    6,
    prod(percent(dm.constellation6.stellar_dmg_), burstFrostglow)
  )
  const c6Frostglow_stellar_dmg_dispObj = objKeyValMap(
    allStellarReactionKeys,
    (k) => [
      `${k}_dmg_`,
      infoMut(
        { ...c6Frostglow_stellar_dmg_disp },
        { path: `${k}_dmg_`, isTeamBuff: true }
      ),
    ]
  )
  const c6Frostglow_stellar_dmg_ = unequal(
    target.charKey,
    charKey,
    c6Frostglow_stellar_dmg_disp
  )
  const c6Frostglow_stellar_dmg_obj = objKeyValMap(
    allStellarReactionKeys,
    (k) => [`${k}_dmg_`, { ...c6Frostglow_stellar_dmg_ }]
  )

  // A1 dmg inc doesn't apply to special CA
  const lockedPassiveData = inferInfoMut({
    ...hitEle.cryo,
    premod: {
      charged_dmgInc: sum(
        lockedPassive_charged_dmgInc,
        prod(-1, a1ScStar_charged_dmgInc)
      ),
    },
  })

  const dmgFormulas = {
    ...dmgForms,
    skill: {
      skillDmg: dmgNode('atk', dm.skill.skillDmg, 'skill'),
      crystalDmg: dmgNode('atk', dm.skill.crystalDmg, 'skill'),
    },
    burst: {
      javelinDmg: equal(
        condA0StellarRadiance,
        undefined,
        customDmgNode(
          prod(
            sum(
              subscript(input.total.burstIndex, dm.burst.javelinDmg, {
                unit: '%',
              }),
              burstFrostglow_javelin_addlMult_
            ),
            input.total.atk
          ),
          'burst'
        )
      ),
      javelinStellarconductDmg: equal(
        condA0StellarRadiance,
        'sc',
        stellarDmgNode(
          sum(
            subscript(
              input.total.burstIndex,
              dm.burst.javelinStellarconductDmg,
              { unit: '%' }
            ),
            burstFrostglow_javelinStellarconduct_addlMult_
          ),
          'atk',
          'stellarconduct',
          'cryo'
        )
      ),
      javelinStellarswirlDmg: equal(
        condA0StellarRadiance,
        'ss',
        stellarDmgNode(
          sum(
            subscript(input.total.burstIndex, dm.burst.javelinStellarswirlDmg, {
              unit: '%',
            }),
            burstFrostglow_javelinStellarswirl_addlMult_
          ),
          'atk',
          'stellarswirl',
          'cryo'
        )
      ),
    },
    passive1: {
      a1ScStar_normal_dmgInc,
      a1ScStar_charged_dmgInc,
      a1ScStar_plunging_dmgInc,
    },
    passive2: {
      a4_eleMas,
    },
    passive3: {
      a0_stellarconduct_baseDmg_,
      a0_stellarswirl_baseDmg_,
    },
    lockedPassive: {
      dmg1: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          undefined,
          dmgNode('atk', dm.charged.dmg1, 'charged', lockedPassiveData)
        )
      ),
      dmg2: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          undefined,
          dmgNode('atk', dm.charged.dmg2, 'charged', lockedPassiveData)
        )
      ),
      stellarconductDmg1: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          'sc',
          stellarDmgNode(
            sum(
              subscript(input.total.autoIndex, dm.charged.dmg1, { unit: '%' }),
              percent(dm.lockedPassive.charged_dmgInc)
            ),
            'atk',
            'stellarconduct',
            'cryo'
          )
        )
      ),
      stellarconductDmg2: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          'sc',
          stellarDmgNode(
            sum(
              subscript(input.total.autoIndex, dm.charged.dmg2, { unit: '%' }),
              percent(dm.lockedPassive.charged_dmgInc)
            ),
            'atk',
            'stellarconduct',
            'cryo'
          )
        )
      ),
      stellarswirlDmg1: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          'ss',
          stellarDmgNode(
            sum(
              subscript(input.total.autoIndex, dm.charged.dmg1, { unit: '%' }),
              percent(dm.lockedPassive.charged_dmgInc)
            ),
            'atk',
            'stellarswirl',
            'cryo'
          )
        )
      ),
      stellarswirlDmg2: equal(
        condLockedPassive,
        'on',
        equal(
          condA0StellarRadiance,
          'ss',
          stellarDmgNode(
            sum(
              subscript(input.total.autoIndex, dm.charged.dmg2, { unit: '%' }),
              percent(dm.lockedPassive.charged_dmgInc)
            ),
            'atk',
            'stellarswirl',
            'cryo'
          )
        )
      ),
    },
  } as const

  const burstC3 = greaterEq(input.constellation, 3, 3)
  const skillC5 = greaterEq(input.constellation, 5, 3)

  const data = dataObjForCharacterSheet(charKey, dmgFormulas, {
    premod: {
      burstBoost: burstC3,
      skillBoost: skillC5,
      normal_dmgInc: a1ScStar_normal_dmgInc,
      charged_dmgInc: a1ScStar_charged_dmgInc,
      plunging_dmgInc: a1ScStar_plunging_dmgInc,
    },
    total: {
      eleMas: a4_eleMas,
    },
    teamBuff: {
      premod: {
        stellarconduct_baseDmg_: a0_stellarconduct_baseDmg_,
        stellarswirl_baseDmg_: a0_stellarswirl_baseDmg_,
        eleMas: sum(c2Crystal_eleMas, c2ActiveStellar_eleMas),
        ...c6Frostglow_stellar_dmg_obj,
      },
    },
    infusion: {
      nonOverridableSelf: a1ScStar_infusion,
    },
  })

  const talent: TalentSheet = {
    skill: ct.talentTem('skill', [
      {
        fields: [
          {
            node: infoMut(dmgFormulas.skill.skillDmg, {
              name: ct.chg('skill.skillParams.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.skill.crystalDmg, {
              name: ct.chg('skill.skillParams.1'),
            }),
          },
          {
            text: ct.chg('skill.skillParams.2'),
            value: dm.skill.starDuration,
            unit: 's',
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
            node: infoMut(dmgFormulas.burst.javelinDmg, {
              name: ct.chg('burst.skillParams.0'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.javelinStellarconductDmg, {
              name: ct.chg('burst.skillParams.2'),
            }),
          },
          {
            node: infoMut(dmgFormulas.burst.javelinStellarswirlDmg, {
              name: ct.chg('burst.skillParams.4'),
            }),
          },
          {
            text: ct.chg('burst.skillParams.6'),
            value: dm.burst.numStrikes,
          },
          {
            text: ct.chg('burst.skillParams.7'),
            value: dm.burst.addlStrikes,
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
        path: condBurstFrostglowPath,
        value: condBurstFrostglow,
        name: ch('burstCond'),
        states: objKeyMap(frostglowArr, (stack) => ({
          name: st('stack', { count: stack }),
          fields: [
            {
              node: infoMut(burstFrostglow_javelin_addlMult_, {
                name: ct.chg('burst.skillParams.1'),
                unit: '%',
              }),
            },
            {
              node: infoMut(burstFrostglow_javelinStellarconduct_addlMult_, {
                name: ct.chg('burst.skillParams.3'),
                unit: '%',
              }),
            },
            {
              node: infoMut(burstFrostglow_javelinStellarswirl_addlMult_, {
                name: ct.chg('burst.skillParams.5'),
                unit: '%',
              }),
            },
          ],
        })),
      }),
      ct.headerTem('constellation6', {
        fields: [
          ...Object.values(c6Frostglow_stellar_dmg_dispObj).map((node) => ({
            node,
          })),
          {
            text: stg('duration'),
            value: dm.constellation6.duration,
            unit: 's',
          },
        ],
      }),
    ]),

    passive1: ct.talentTem('passive1', [
      ct.condTem('passive1', {
        path: condA1ScStarPath,
        value: condA1ScStar,
        name: ch('a1Cond'),
        canShow: equal(condA0StellarRadiance, 'sc', 1),
        states: {
          on: {
            fields: [
              {
                text: <ColorText color="cryo">{st('infusion.cryo')}</ColorText>,
              },
              {
                node: a1ScStar_normal_dmgInc,
              },
              { node: a1ScStar_charged_dmgInc },
              {
                node: a1ScStar_plunging_dmgInc,
              },
            ],
          },
        },
      }),
    ]),
    passive2: ct.talentTem('passive2', [
      {
        fields: [
          {
            node: a4_eleMas,
          },
        ],
      },
    ]),
    passive3: ct.talentTem('passive3', [
      ct.headerTem('passive3', {
        teamBuff: true,
        fields: [
          {
            node: a0_stellarconduct_baseDmg_,
          },
          {
            node: a0_stellarswirl_baseDmg_,
          },
        ],
      }),
      ct.condTem('passive3', {
        path: condA0StellarRadiancePath,
        value: condA0StellarRadiance,
        name: st('elementalReaction.stellar.radiance'),
        states: {
          sc: {
            name: st('elementalReaction.polestar.inside'),
            fields: [
              {
                text: st('elementalReaction.stellar.gainRadianceSc'),
              },
            ],
          },
          ss: {
            name: st('elementalReaction.stellarswirl'),
            fields: [
              {
                text: st('elementalReaction.stellar.gainRadianceSs'),
              },
              {
                text: stg('duration'),
                value: 8,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    lockedPassive: ct.talentTem('lockedPassive', [
      ct.fieldsTem('lockedPassive', {
        canShow: equal(condLockedPassive, 'on', 1),
        fields: [
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg1, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.dmg2, {
              name: ct.chg('auto.skillParams.5'),
              textSuffix: '(2)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.stellarconductDmg1, {
              name: ch('caScDmg'),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.stellarconductDmg2, {
              name: ch('caScDmg'),
              textSuffix: '(2)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.stellarswirlDmg1, {
              name: ch('caSsDmg'),
              textSuffix: '(1)',
            }),
          },
          {
            node: infoMut(dmgFormulas.lockedPassive.stellarswirlDmg2, {
              name: ch('caSsDmg'),
              textSuffix: '(2)',
            }),
          },
          {
            node: lockedPassive_charged_dmgInc,
          },
          {
            text: stg('cd'),
            value: dm.lockedPassive.cd,
            unit: 's',
          },
        ],
      }),
    ]),
    constellation1: ct.talentTem('constellation1'),
    constellation2: ct.talentTem('constellation2', [
      ct.condTem('constellation2', {
        path: condC2CrystalPath,
        value: condC2Crystal,
        teamBuff: true,
        name: ch('c2CrystalCond'),
        states: {
          on: {
            fields: [
              {
                node: c2Crystal_eleMas_disp,
              },
              {
                text: stg('duration'),
                value: dm.constellation2.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
      ct.condTem('constellation2', {
        path: condC2ActiveStellarPath,
        value: condC2ActiveStellar,
        teamBuff: true,
        canShow: equal(condC2Crystal, 'on', 1),
        name: st('elementalReaction.stellar.triggerOrHit'),
        states: {
          on: {
            fields: [
              {
                node: c2ActiveStellar_eleMas_disp,
              },
              {
                text: stg('duration'),
                value: dm.constellation2.duration,
                unit: 's',
              },
            ],
          },
        },
      }),
    ]),
    constellation3: ct.talentTem('constellation3', [
      { fields: [{ node: burstC3 }] },
    ]),
    constellation4: ct.talentTem('constellation4'),
    constellation5: ct.talentTem('constellation5', [
      { fields: [{ node: skillC5 }] },
    ]),
    constellation6: ct.talentTem('constellation6'),
  }

  return {
    talent,
    data,
  }
}
