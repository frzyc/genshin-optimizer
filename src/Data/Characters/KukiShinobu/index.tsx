import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { compareEq, constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "KukiShinobu"
const elementKey: ElementKey = "electro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    ringHealHP_: skillParam_gen.skill[s++],
    ringHealFlat: skillParam_gen.skill[s++],
    ringDmg: skillParam_gen.skill[s++],
    cost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0]
  },
  burst: {
    singleDmg: skillParam_gen.burst[b++],
    maxDmgBase: skillParam_gen.burst[b++],
    maxDmgExtend: skillParam_gen.burst[b++],
    durationBase: skillParam_gen.burst[b++][0],
    durationExtend: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    hpThresh_: skillParam_gen.passive1[p1++][0],
    heal_: skillParam_gen.passive1[p1++][0]
  },
  passive2: {
    emSkillHeal_: skillParam_gen.passive2[p2++][0],
    emSkillDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    aoeInc: 0.5,
  },
  constellation2: {
    skillDurInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    markDmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hpThresh_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    em: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const [condUnderHPPath, condUnderHP] = cond(key, "underHP")
const a1Heal_ = greaterEq(input.asc, 1, equal(condUnderHP, "on", datamine.passive1.heal_))

const a4Skill_healInc = greaterEq(input.asc, 4, prod(percent(datamine.passive2.emSkillHeal_), input.total.eleMas))
const a4Skill_dmgInc = greaterEq(input.asc, 4, prod(percent(datamine.passive2.emSkillDmg_), input.total.eleMas))

const [condC6TriggerPath, condC6Trigger] = cond(key, "c6Trigger")
const c6eleMas = greaterEq(input.constellation, 6, equal(condC6Trigger, "on", datamine.constellation6.em))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    pressDmg: dmgNode("atk", datamine.skill.pressDmg, "skill"),
    ringHeal: healNodeTalent("hp", datamine.skill.ringHealHP_, datamine.skill.ringHealFlat, "skill",
      { premod: { healInc: a4Skill_healInc } }
    ),
    ringDmg: dmgNode("atk", datamine.skill.ringDmg, "skill"),
  },
  burst: {
    singleDmg: dmgNode("hp", datamine.burst.singleDmg, "burst"),
    totalDmg: compareEq(condUnderHP, "on",
      dmgNode("hp", datamine.burst.maxDmgExtend, "burst"),
      dmgNode("hp", datamine.burst.maxDmgBase, "burst")
    )
  },
  constellation4: {
    markDmg: greaterEq(input.constellation, 4, customDmgNode(prod(percent(datamine.constellation4.markDmg), input.total.hp), "elemental", { hit: { ele: constant(elementKey) } })),
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
    heal_: a1Heal_,
    skill_dmgInc: a4Skill_dmgInc,
    eleMas: c6eleMas,
  },
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.4` }),
          textSuffix: "(1)"
        }, {
          node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.4` }),
          textSuffix: "(2)"
        }, {
          text: tr("auto.skillParams.5"),
          value: datamine.charged.stamina,
        }]
      }, {
        text: tr("auto.fields.plunging"),
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
          node: infoMut(dmgFormulas.skill.pressDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.skill.ringHeal, { key: `char_${key}_gen:skill.skillParams.1` })
        }, {
          node: infoMut(dmgFormulas.skill.ringDmg, { key: `char_${key}_gen:skill.skillParams.2` }),
        }, {
          text: tr("skill.skillParams.3"),
          value: datamine.skill.cost * 100,
          unit: trm("skill.cost"),
        }, {
          text: sgt("duration"),
          value: (data) => data.get(input.constellation).value >= 2
            ? `${datamine.skill.duration}s + ${datamine.constellation2.skillDurInc}s = ${datamine.skill.duration + datamine.constellation2.skillDurInc}`
            : datamine.skill.duration,
          unit: "s",
        }, {
          text: sgt("cd"),
          value: datamine.skill.cd,
          unit: "s"
        }]
      }, ct.headerTemplate("passive2", {
        fields: [{
          node: infoMut(a4Skill_healInc, { key: `char_${key}:a4.heal`, variant: "heal" }),
        }, {
          node: a4Skill_dmgInc
        }]
      }), ct.headerTemplate("constellation2", {
        fields: [{
          text: st("durationInc"),
          value: datamine.constellation2.skillDurInc,
          unit: "s",
        }]
      }), ct.headerTemplate("constellation4", {
        fields: [{
          node: infoMut(dmgFormulas.constellation4.markDmg, { key: `char_${key}:c4.dmg` })
        }, {
          text: sgt("cd"),
          value: datamine.constellation4.cd,
          unit: "s",
        }]
      })]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.singleDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.burst.totalDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
        }, {
          text: sgt("duration"),
          value: (data) => data.get(condUnderHP).value === "on"
            ? `${datamine.burst.durationBase}s + ${datamine.burst.durationExtend - datamine.burst.durationBase}s = ${datamine.burst.durationExtend}`
            : datamine.burst.durationBase,
          unit: "s",
        }, {
          text: sgt("cd"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: sgt("energyCost"),
          value: datamine.burst.cost,
        }]
      }, ct.conditionalTemplate("burst", {
        name: st("lessEqPercentHP", { percent: datamine.passive1.hpThresh_ * 100 }),
        value: condUnderHP,
        path: condUnderHPPath,
        states: {
          on: {
            fields: [{
              text: st("durationInc"),
              value: datamine.burst.durationExtend - datamine.burst.durationBase,
              fixed: 1,
              unit: "s",
            }]
          }
        }
      }), ct.headerTemplate("constellation1", {
        fields: [{
          text: st("aoeInc"),
          value: datamine.constellation1.aoeInc * 100,
          unit: "%",
        }]
      })]),

      passive1: ct.talentTemplate("passive1", [ct.conditionalTemplate("passive1", {
        name: st("lessEqPercentHP", { percent: datamine.passive1.hpThresh_ * 100 }),
        value: condUnderHP,
        path: condUnderHPPath,
        states: {
          on: {
            fields: [{
              node: a1Heal_
            }]
          }
        }
      })]),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1"),
      constellation2: ct.talentTemplate("constellation2"),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
      constellation4: ct.talentTemplate("constellation4"),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
      constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
        value: condC6Trigger,
        path: condC6TriggerPath,
        name: st("lessPercentHP", { percent: datamine.constellation6.hpThresh_ * 100 }),
        states: {
          on: {
            fields: [{
              node: c6eleMas,
            }, {
              text: sgt("duration"),
              value: datamine.constellation6.duration,
              unit: "s",
            }, {
              text: sgt("cd"),
              value: datamine.constellation6.cd,
              unit: "s",
            }]
          }
        }
      })]),
    },
  }
export default new CharacterSheet(sheet, data, assets)
