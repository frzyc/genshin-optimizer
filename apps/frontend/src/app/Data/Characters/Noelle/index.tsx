import { CharacterData } from '@genshin-optimizer/pipeline'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '@genshin-optimizer/consts'
import { cond, stg, st } from '../../SheetUtil'
import CharacterSheet from '../CharacterSheet'
import { charTemplates } from '../charTemplates'
import { ICharacterSheet } from '../ICharacterSheet.d'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent, shieldElement, shieldNode, shieldNodeTalent } from '../dataUtil'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Noelle"
const elementKey: ElementKey = "geo"
const ct = charTemplates(key, data_gen.weaponTypeKey)

let a = 0, s = 0, b = 0, p1 = 0
const dm = {
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
    subscript(input.total.burstIndex, dm.burst.defToAtk, { unit: "%" }),
    greaterEq(input.constellation, 6, percent(dm.constellation6.burstAtkBonus))
  )
))

const nodeSkillHealChanceBase = subscript(input.total.skillIndex, dm.skill.healChance, { name: ct.ch("skillHeal_"), unit: "%" })
const nodeSkillHealChanceC1BurstOn = equal("on", condBurst, percent(dm.constellation1.healingChance), { name: ct.ch("skillHeal_"), unit: "%" })
const nodeSkillHealChanceC1BurstOff = unequal("on", condBurst, nodeSkillHealChanceBase)

const nodeC2ChargeDMG = greaterEq(input.constellation, 2, percent(dm.constellation2.chargeDmg_))
const nodeC2ChargeDec = greaterEq(input.constellation, 2, percent(-dm.constellation2.chargeStamina))
const nodeC4dmg = greaterEq(input.constellation, 4, customDmgNode(prod(input.total.atk, percent(dm.constellation4.skillDmg)), "elemental", { hit: { ele: constant(elementKey) } }))

const dmgFormulas = {
  normal: Object.fromEntries(dm.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", dm.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", dm.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(dm.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("def", dm.skill.skillDmg, "skill"),
    shield: shieldElement("geo", shieldNodeTalent("def", dm.skill.shieldDef, dm.skill.shieldFlat, "skill")),
    heal: healNodeTalent("def", dm.skill.healDef, dm.skill.healFlat, "skill"),
  },
  burst: {
    defConv: nodeBurstAtk,
    burstDmg: dmgNode("atk", dm.burst.burstDmg, "burst"),
    skillDmg: dmgNode("atk", dm.burst.skillDmg, "burst"),
  },
  passive1: {
    devotionShield: greaterEq(input.asc, 1, shieldElement("geo", shieldNode("def", percent(dm.passive1.shield), 0)))
  },
  constellation4: {
    dmg: nodeC4dmg
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  premod: {
    skillBoost: nodeC3,
    burstBoost: nodeC5,
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
  name: ct.chg("name"),
  rarity: data_gen.star,
  elementKey: "geo",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: ct.chg("constellationName"),
  title: ct.chg("title"),
  talent: {
    auto: ct.talentTem("auto", [{
      text: ct.chg("auto.fields.normal"),
    }, {
      fields: dm.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { name: ct.chg(`auto.skillParams.${i}`) }),
      }))
    }, {
      text: ct.chg("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spinningDmg, { name: ct.chg(`auto.skillParams.4`) }),
      }, {
        node: infoMut(dmgFormulas.charged.finalDmg, { name: ct.chg(`auto.skillParams.5`) }),
      }, {
        text: ct.chg("auto.skillParams.6"),
        value: dm.charged.stamina,
        unit: '/s'
      }, {
        text: ct.chg("auto.skillParams.7"),
        value: dm.charged.duration,
        unit: 's'
      }],
    }, {
      text: ct.chg("auto.fields.plunging"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.plunging.dmg, { name: stg("plunging.dmg") }),
      }, {
        node: infoMut(dmgFormulas.plunging.low, { name: stg("plunging.low") }),
      }, {
        node: infoMut(dmgFormulas.plunging.high, { name: stg("plunging.high") }),
      }],
    }]),

    skill: ct.talentTem("skill", [{
      fields: [{
        node: infoMut(dmgFormulas.skill.dmg, { name: ct.chg(`skill.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.skill.shield, { name: ct.chg(`skill.skillParams.1`) }),
      }, {
        node: infoMut(dmgFormulas.skill.heal, { name: ct.chg(`skill.skillParams.2`) }),
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
        text: ct.chg("skill.skillParams.4"),
        value: dm.skill.shieldDuration,
        unit: "s"
      }, { //Cooldown
        canShow: data => data.get(input.asc).value < 4,
        text: ct.chg("skill.skillParams.5"),
        value: dm.skill.cd,
        unit: "s"
      }, {
        canShow: data => data.get(input.asc).value >= 4,
        text: ct.chg("skill.skillParams.5"),
        value: ct.ch(`p4cd`),
      }]
    }]),

    burst: ct.talentTem("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.burstDmg, { name: ct.chg(`burst.skillParams.0`) }),
      }, {
        node: infoMut(dmgFormulas.burst.skillDmg, { name: ct.chg(`burst.skillParams.1`) }),
      }, {
        canShow: data => data.get(input.constellation).value < 6,
        text: ct.chg("burst.skillParams.3"),
        value: dm.burst.duration,
        unit: "s"
      }, {
        canShow: data => data.get(input.constellation).value >= 6,
        text: ct.chg("burst.skillParams.3"),
        value: ct.ch(`c6duration`),
      }, {
        text: ct.chg("burst.skillParams.4"),
        value: dm.burst.cd,
      }, {
        text: ct.chg("burst.skillParams.5"),
        value: dm.burst.enerCost,
      }],
    }, ct.condTem("burst", {
      name: ct.chg("burst.name"),
      value: condBurst,
      path: condBurstPath,
      states: {
        on: {
          fields: [{
            text: st("infusion.geo"),
            variant: "geo",
          }, {
            text: ct.ch("qlarger")
          }, {
            node: nodeBurstAtk
          }]
        }
      }
    })]),

    passive1: ct.talentTem("passive1", [ct.fieldsTem("passive1", {
      fields: [{
        node: infoMut(dmgFormulas.passive1.devotionShield, { name: ct.chg(`skill.skillParams.1`) })
      }, {
        text: ct.chg("skill.skillParams.4"),
        value: dm.passive1.duration,
        unit: "s"
      }, {
        text: ct.chg("skill.skillParams.5"),
        value: dm.passive1.cooldown,
        unit: "s"
      }]
    })]),
    passive2: ct.talentTem("passive2"),
    passive3: ct.talentTem("passive3"),
    constellation1: ct.talentTem("constellation1"),
    constellation2: ct.talentTem("constellation2", [ct.fieldsTem("constellation2", {
      fields: [{
        node: nodeC2ChargeDec
      }, {
        node: nodeC2ChargeDMG
      }]
    })]),
    constellation3: ct.talentTem("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTem("constellation4", [ct.fieldsTem("constellation4", {
      fields: [{
        node: infoMut(nodeC4dmg, { name: ct.ch("c4dmg") })
      }]
    })]),
    constellation5: ct.talentTem("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTem("constellation6"),
  },
}

export default new CharacterSheet(sheet, data)
