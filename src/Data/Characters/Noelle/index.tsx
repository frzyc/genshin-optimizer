import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent, shieldElement, shieldNode, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Noelle"
const elementKey: ElementKey = "geo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shieldDef: skillParam_gen.skill[s++],
    healDef: skillParam_gen.skill[s++],
    healChance: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    skillDmg: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    healFlat: skillParam_gen.skill[s++],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    skillDmg: skillParam_gen.burst[b++],
    defToAtk: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: { // Devotion Shield
    hpThreshold: skillParam_gen.passive1[p1++][0],
    shield: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
    cooldown: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    healingChance: skillParam_gen.constellation1[0],
  },
  constellation2: {
    chargeStamina: skillParam_gen.constellation2[0],
    chargeDmg_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    skillDmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    burstAtkBonus: skillParam_gen.constellation6[0],
  },
} as const

const [condBurstPath, condBurst] = cond(key, "SweepingTime")
const nodeBurstInfusion = equalStr(condBurst, "on", "geo")
const nodeBurstAtk = equal("on", condBurst, prod(
  input.total.def,
  sum(
    subscript(input.total.burstIndex, datamine.burst.defToAtk, { key: "_" }),
    greaterEq(input.constellation, 6, percent(datamine.constellation6.burstAtkBonus))
  )
))

const nodeSkillHealChanceBase = subscript(input.total.skillIndex, datamine.skill.healChance, { key: `char_${key}:skillHeal_` })
const nodeSkillHealChanceC1BurstOn = equal("on", condBurst, percent(datamine.constellation1.healingChance), { key: `char_${key}:skillHeal_` })
const nodeSkillHealChanceC1BurstOff = unequal("on", condBurst, nodeSkillHealChanceBase)

const nodeC2ChargeDMG = greaterEq(input.constellation, 2, percent(datamine.constellation2.chargeDmg_))
const nodeC2ChargeDec = greaterEq(input.constellation, 2, percent(-datamine.constellation2.chargeStamina))
const nodeC4dmg = greaterEq(input.constellation, 4, customDmgNode(prod(input.total.atk, percent(datamine.constellation4.skillDmg)), "elemental", { hit: { ele: constant(elementKey) } }))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("def", datamine.skill.skillDmg, "skill"),
    shield: shieldElement("geo", shieldNodeTalent("def", datamine.skill.shieldDef, datamine.skill.shieldFlat, "skill")),
    heal: healNodeTalent("def", datamine.skill.healDef, datamine.skill.healFlat, "skill"),
  },
  burst: {
    defConv: nodeBurstAtk,
    burstDmg: dmgNode("atk", datamine.burst.burstDmg, "burst"),
    skillDmg: dmgNode("atk", datamine.burst.skillDmg, "burst"),
  },
  passive1: {
    devotionShield: greaterEq(input.asc, 1, shieldElement("geo", shieldNode("def", percent(datamine.passive1.shield), 0)))
  },
  constellation4: {
    dmg: nodeC4dmg
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  premod: {
    charged_dmg_: nodeC2ChargeDMG,
    atk: nodeBurstAtk,
    staminaChargedDec_: nodeC2ChargeDec,
  },
  infusion: {
    nonOverridableSelf: nodeBurstInfusion,
  },
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey: "geo",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: datamine.charged.stamina,
        unit: '/s'
      }, {
        text: tr("auto.skillParams.7"),
        value: datamine.charged.duration,
        unit: 's'
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
        node: infoMut(dmgFormulas.skill.shield, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.skill.heal, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, { //Heal trigger chance
        canShow: data => data.get(input.constellation).value === 0,
        node: nodeSkillHealChanceBase,
      }, {
        canShow: data => data.get(input.constellation).value >= 1,
        node: nodeSkillHealChanceC1BurstOff,
      }, {
        canShow: data => data.get(input.constellation).value >= 1,
        node: nodeSkillHealChanceC1BurstOn,
      }, { //Shield Duration
        text: tr("skill.skillParams.4"),
        value: datamine.skill.shieldDuration,
        unit: "s"
      }, { //Cooldown
        canShow: data => data.get(input.asc).value < 4,
        text: tr("skill.skillParams.5"),
        value: datamine.skill.cd,
        unit: "s"
      }, {
        canShow: data => data.get(input.asc).value >= 4,
        text: tr("skill.skillParams.5"),
        value: trm(`p4cd`),
      }]
    }]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.burstDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.skillDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        canShow: data => data.get(input.constellation).value < 6,
        text: tr("burst.skillParams.3"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        canShow: data => data.get(input.constellation).value >= 6,
        text: tr("burst.skillParams.3"),
        value: trm(`c6duration`),
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cd,
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.enerCost,
      }],
    }, ct.conditionalTemplate("burst", {
      name: tr("burst.name"),
      value: condBurst,
      path: condBurstPath,
      states: {
        on: {
          fields: [{
            text: st("infusion.geo"),
            variant: "geo",
          }, {
            text: trm("qlarger")
          }, {
            node: nodeBurstAtk
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1", [ct.fieldsTemplate("passive1", {
      fields: [{
        node: infoMut(dmgFormulas.passive1.devotionShield, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        text: tr("skill.skillParams.4"),
        value: datamine.passive1.duration,
        unit: "s"
      }, {
        text: tr("skill.skillParams.5"),
        value: datamine.passive1.cooldown,
        unit: "s"
      }]
    })]),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [ct.fieldsTemplate("constellation2", {
      fields: [{
        node: nodeC2ChargeDec
      }, {
        node: nodeC2ChargeDMG
      }]
    })]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.fieldsTemplate("constellation4", {
      fields: [{
        node: infoMut(nodeC4dmg, { key: `char_${key}:c4dmg` })
      }]
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}

export default new CharacterSheet(sheet, data, assets)
