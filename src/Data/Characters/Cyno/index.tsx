import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Cyno"
const elementKey: ElementKey = "electro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let s = 0, b = 5, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3x2
      // skillParam_gen.auto[3], // 3x2
      skillParam_gen.auto[4], // 4
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[7],
    low: skillParam_gen.auto[8],
    high: skillParam_gen.auto[9],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    riteDmg: skillParam_gen.skill[s++],
    durationBonus: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdRite: skillParam_gen.skill[s++][0],
  },
  burst: {
    normal: {
      hitArr: [
        skillParam_gen.burst[0], // 1
        skillParam_gen.burst[1], // 2
        skillParam_gen.burst[2], // 3
        skillParam_gen.burst[3], // 4x2
        // skillParam_gen.burst[4], // 4x2
        skillParam_gen.burst[b++], // 5
      ],
    },
    charged: {
      dmg: skillParam_gen.burst[b++],
      stamina: skillParam_gen.burst[b++][0],
    },
    plunging: {
      dmg: skillParam_gen.burst[b++],
      low: skillParam_gen.burst[b++],
      high: skillParam_gen.burst[b++],
    },
    eleMas: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    skill_dmg_: skillParam_gen.passive1[p1++][0],
    boltDmg: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    burst_normal_dmgInc_: skillParam_gen.passive2[p2++][0],
    bolt_dmgInc_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    normal_atkSpd_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    electro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    maxStacks: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    charges: skillParam_gen.constellation4[1],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const afterBurst_eleMas = equal(condAfterBurst, "on", datamine.burst.eleMas)

const [condA1JudicationPath, condA1Judication] = cond(key, "a1Judication")
const a1Judication_skill_dmg_ = greaterEq(input.asc, 1,
  equal(condA1Judication, "on", datamine.passive1.skill_dmg_)
)

// TODO: Check if this is total or premod
// If it is total, this fits with Shenhe, where dmgInc is allowed to inherit from total
// If it is premod, this breaks Shenhe's "precedent"
const a4_burstNormal_dmgInc = greaterEq(input.asc, 4,
  prod(percent(datamine.passive2.burst_normal_dmgInc_), input.total.eleMas)
)
const a4_bolt_dmgInc = greaterEq(input.asc, 4,
  prod(percent(datamine.passive2.bolt_dmgInc_), input.total.eleMas)
)

const c1_atkSPD_ = greaterEq(input.constellation, 1,
  greaterEq(input.asc, 1, datamine.constellation1.normal_atkSpd_)
)

const c2NormHitStacksArr = range(1, datamine.constellation2.maxStacks)
const [condC2NormHitStacksPath, condC2NormHitStacks] = cond(key, "c2NormHitStacks")
const c2_electro_dmg_ = greaterEq(input.constellation, 2,
  lookup(condC2NormHitStacks, Object.fromEntries(c2NormHitStacksArr.map(stack => [
    stack,
    prod(percent(datamine.constellation2.electro_dmg_), stack)
  ])), naught)
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    skillDmg: dmgNode("atk", datamine.skill.skillDmg, "skill"),
    riteDmg: dmgNode("atk", datamine.skill.riteDmg, "skill"),
  },
  burst: {
    ...Object.fromEntries(datamine.burst.normal.hitArr.map((arr, i) =>
      [`normal_${i}`, customDmgNode(prod(
        subscript(input.total.burstIndex, arr, { key: "_" }),
        input.total.atk
      ), "normal", { hit: { ele: constant(elementKey) }, premod: { normal_dmgInc: a4_burstNormal_dmgInc } })]
    )),
    charged: customDmgNode(prod(
      subscript(input.total.burstIndex, datamine.burst.charged.dmg, { key: "_" }),
      input.total.atk
    ), "charged", { hit: { ele: constant(elementKey) } }),
    ...Object.fromEntries(Object.entries(datamine.burst.plunging).map(([key, value]) =>
      [`plunging_${key}`, customDmgNode(prod(
        subscript(input.total.burstIndex, value, { key: "_" }),
        input.total.atk
      ), "plunging", { hit: { ele: constant(elementKey) } })]
    )),
  },
  passive1: {
    boltDmg: greaterEq(input.asc, 1, customDmgNode(prod(
      datamine.passive1.boltDmg, input.total.atk
    ), "skill", { hit: { ele: constant(elementKey) }, premod: { skill_dmgInc: a4_bolt_dmgInc } }))
  },
  passive2: {
    burstNormalDmgInc: a4_burstNormal_dmgInc,
    boltDmgInc: a4_bolt_dmgInc
  }
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  bonus: {
    burst: burstC3,
    skill: skillC5
  },
  premod: {
    eleMas: afterBurst_eleMas,
    skill_dmg_: a1Judication_skill_dmg_,
    atkSPD_: c1_atkSPD_,
    electro_dmg_: c2_electro_dmg_
  },
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
      auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          textSuffix: i === 2 ? st("brHits", { count: 2 }) : ""
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.4` }),
        }, {
          text: tr("auto.skillParams.5"),
          value: datamine.charged.stamina,
        }]
      }, {
        text: tr(`auto.fields.plunging`),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]
      }]),

      skill: ct.talentTemplate("skill", [{
        fields: [{
          node: infoMut(dmgFormulas.skill.skillDmg, { key: `char_${key}_gen:skill.skillParams.0` })
        }, {
          node: infoMut(dmgFormulas.skill.riteDmg, { key: `char_${key}_gen:skill.skillParams.1` })
        }, {
          text: tr("skill.skillParams.2"),
          value: datamine.skill.durationBonus,
          unit: "s"
        }, {
          text: sgt("cd"),
          value: datamine.skill.cd,
          unit: "s",
          fixed: 1
        }, {
          text: tr("skill.skillParams.4"),
          value: datamine.skill.cdRite,
          unit: "s"
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [
          ...datamine.burst.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.burst[`normal_${i}`], { key: `char_${key}_gen:burst.skillParams.${i}` }),
            textSuffix: i === 3 ? st("brHits", { count: 2 }) : ""
          })), {
            node: infoMut(dmgFormulas.burst.charged, { key: `char_${key}_gen:burst.skillParams.5` }),
          }, {
            text: tr("burst.skillParams.6"),
            value: datamine.burst.charged.stamina,
          },
          ...Object.entries(datamine.burst.plunging).map(([key]) => ({
            node: infoMut(dmgFormulas.burst[`plunging_${key}`], { key: `sheet_gen:plunging.${key}` })
          })), {
            text: sgt("duration"),
            value: datamine.burst.duration,
            unit: "s"
          }, {
            text: sgt("cd"),
            value: datamine.burst.cd,
            unit: "s"
          }, {
            text: sgt("energyCost"),
            value: datamine.burst.enerCost,
          }
        ]
      }, ct.conditionalTemplate("burst", {
        path: condAfterBurstPath,
        value: condAfterBurst,
        name: st("afterUse.burst"),
        states: {
          on: {
            fields: [{
              node: afterBurst_eleMas
            }]
          }
        }
      }), ct.headerTemplate("constellation1", {
        canShow: greaterEq(input.asc, 1, 1),
        fields: [{
          node: c1_atkSPD_
        }]
      })]),

      passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
        fields: [{
          node: infoMut(dmgFormulas.passive1.boltDmg, { key: `char_${key}:p1Dmg` })
        }]
      }), ct.conditionalTemplate("passive1", {
        path: condA1JudicationPath,
        value: condA1Judication,
        name: trm("judication"),
        states: {
          on: {
            fields: [{
              node: a1Judication_skill_dmg_
            }]
          }
        }
      })]),
      passive2: ct.talentTemplate("passive2", [ct.fieldsTemplate("passive2", {
        fields: [{
          node: infoMut(dmgFormulas.passive2.burstNormalDmgInc, { key: `char_${key}:burstNormalDmgInc` })
        }, {
          node: infoMut(dmgFormulas.passive2.boltDmgInc, { key: `char_${key}:boltDmgInc` })
        }]
      })]),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
        path: condC2NormHitStacksPath,
        value: condC2NormHitStacks,
        name: st("hitOp.normal"),
        states: Object.fromEntries(c2NormHitStacksArr.map(stack => [
          stack,
          {
            name: st("stack", { count: stack }),
            fields: [{ node: c2_electro_dmg_ }]
          }
        ]))
      })]),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    }
}
export default new CharacterSheet(sheet, data, assets)
