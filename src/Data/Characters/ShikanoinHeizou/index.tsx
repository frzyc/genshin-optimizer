import { CharacterData } from 'pipeline'
import { input, target } from "../../../Formula/index"
import { constant, equal, greaterEq, infoMut, lookup, naught, percent, prod, subscript, sum, unequal } from "../../../Formula/utils"
import { absorbableEle, CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "ShikanoinHeizou"
const elementKey: ElementKey = "anemo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 4.3
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    declension_dmg_: skillParam_gen.skill[s++],
    conviction_dmg_: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    declension_duration: skillParam_gen.skill[s++][0],
  },
  burst: {
    slugger_dmg: skillParam_gen.burst[b++],
    iris_dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[p2++][0],
    eleMas: skillParam_gen.passive2[p2++][0],
  },
  passive3: {
    staminaSprintDec_: 0.25,
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    atkSpd_: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation4: {
    baseEnergy: skillParam_gen.constellation4[0],
    addlEnergy: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hsCritRate_: skillParam_gen.constellation6[0],
    hsCritDmg_: skillParam_gen.constellation6[1],
  }
} as const

const stacksArr = range(1, 4)
const [condDeclensionStacksPath, condDeclensionStacks] = cond(key, "declensionStacks")
const declension_dmg_ = lookup(
  condDeclensionStacks,
  Object.fromEntries(stacksArr.map(stacks => [
    stacks,
    prod(
      subscript(input.total.skillIndex, datamine.skill.declension_dmg_, { key: "sheet:bonusScaling.skill_" }),
      constant(stacks, { key: `char_${key}:declensionStacks` })
    )
  ])), naught, { key: "sheet:bonusScaling.skill_" })
const conviction_dmg_ = equal(condDeclensionStacks, "4",
  subscript(input.total.skillIndex, datamine.skill.conviction_dmg_, { key: "_" }),
  { key: "sheet:bonusScaling.skill_" }
)
const totalStacks_dmg_ = sum(declension_dmg_, conviction_dmg_)

const [condSkillHitPath, condSkillHit] = cond(key, "skillHit")
const a4_eleMasDisp = greaterEq(input.asc, 4,
  equal(condSkillHit, "on", datamine.passive2.eleMas)
)
const a4_eleMas = unequal(target.charKey, key, a4_eleMasDisp)

// TODO: After non-stacking buffs
// const staminaSprintDec_ = percent(datamine.passive3.staminaSprintDec_)

const [condTakeFieldPath, condTakeField] = cond(key, "takeField")
const c1_atkSpd_ = greaterEq(input.constellation, 1, equal(condTakeField, "on", percent(datamine.constellation1.atkSpd_)))

const c6_skill_critRate_ = greaterEq(input.constellation, 6, lookup(
  condDeclensionStacks,
  Object.fromEntries(stacksArr.map(stacks => [
    stacks,
    prod(
      percent(datamine.constellation6.hsCritRate_),
      constant(stacks, { key: `char_${key}:declensionStacks` })
    )
  ])),
  naught
))
const c6_skill_critDMG_ = greaterEq(input.constellation, 6,
  equal(condDeclensionStacks, "4", percent(datamine.constellation6.hsCritDmg_))
)

export const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: customDmgNode(
      prod(
        sum(
          subscript(input.total.skillIndex, datamine.skill.dmg, { key: "_" }),
          totalStacks_dmg_
        ),
        input.total.atk
      ),
      "skill",
      { hit: { ele: constant("anemo") } }
    )
  },
  burst: {
    slugger_dmg: dmgNode("atk", datamine.burst.slugger_dmg, "burst"),
    ...Object.fromEntries(absorbableEle.map(ele => [
      `${ele}_iris_dmg`,
      dmgNode("atk", datamine.burst.iris_dmg, "burst", { hit: { ele: constant(ele) } })
    ]))
  },
}

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5,
  },
  premod: {
    atkSPD_: c1_atkSpd_,
    skill_critRate_: c6_skill_critRate_,
    skill_critDMG_: c6_skill_critDMG_,
  },
  teamBuff: {
    premod: {
      // TODO: after non-stacking buffs
      // staminaSprintDec_
      eleMas: a4_eleMas,
    }
  }
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
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal")
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(
            dmgFormulas.normal[i],
            { key: `char_${key}_gen:auto.skillParams.${i > 2 ? (i < 6 ? 3 : 4) : i}` }
          ),
          textSuffix: (i > 2 && i < 6) ? `(${i - 2})` : undefined,
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          text: tr("auto.skillParams.6"),
          value: datamine.charged.stamina,
        }],
      }, {
        text: tr("auto.fields.plunging"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }],
      }]),

      skill: ct.talentTemplate("skill", [{
        fields: [{
          node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          text: sgt("cd"),
          value: datamine.skill.cd,
          unit: "s"
        }]
      }, ct.conditionalTemplate("skill", {
        path: condDeclensionStacksPath,
        value: condDeclensionStacks,
        name: trm("declensionStacks"),
        states: Object.fromEntries(stacksArr.map(stacks => [
          stacks,
          {
            name: st("stack", { count: stacks }),
            fields: [{
              node: infoMut(totalStacks_dmg_, { key: "sheet:bonusScaling.skill_" })
            }, {
              canShow: (data) => data.get(condDeclensionStacks).value === "4",
              text: st("aoeInc"),
            }, {
              text: sgt("duration"),
              value: datamine.skill.declension_duration,
              unit: "s"
            }]
          }
        ]))
      }), ct.conditionalTemplate("passive2", {
        path: condSkillHitPath,
        value: condSkillHit,
        name: st("hitOp.skill"),
        teamBuff: true,
        canShow: unequal(target.charKey, input.activeCharKey, 1),
        states: {
          on: {
            fields: [{
              node: infoMut(a4_eleMasDisp, { key: "eleMas" }),
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: "s"
            }]
          }
        }
      }), ct.headerTemplate("constellation6", {
        fields: [{
          node: c6_skill_critRate_
        }, {
          node: c6_skill_critDMG_
        }]
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.slugger_dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, ...absorbableEle.map(ele => ({
          node: infoMut(dmgFormulas.burst[`${ele}_iris_dmg`], { key: `char_${key}_gen:burst.skillParams.1` }),
        })), {
          text: sgt("cd"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: sgt("energyCost"),
          value: datamine.burst.enerCost,
        }]
      }]),

      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"/* TODO: after non-stacking buffs, [{ fields: [{ node: staminaSprintDec_ }] }]*/),
      constellation1: ct.talentTemplate("constellation1", [ct.conditionalTemplate("constellation1", {
        path: condTakeFieldPath,
        value: condTakeField,
        name: trm("takingField"),
        states: {
          on: {
            fields: [{
              node: c1_atkSpd_
            }, {
              text: sgt("duration"),
              value: datamine.constellation1.duration,
              unit: "s"
            }, {
              text: sgt("cd"),
              value: datamine.constellation1.cd,
              unit: "s"
            }]
          }
        }
      })]),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
      constellation6: ct.talentTemplate("constellation6"),
    },
  }
export default new CharacterSheet(sheet, data, assets)
