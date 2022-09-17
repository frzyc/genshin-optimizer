import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent, shieldElement, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Diona"
const elementKey: ElementKey = "cryo"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ]
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    icyPawDmg: skillParam_gen.skill[s++],
    shieldHp_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    cdPress: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    fieldDmg: skillParam_gen.burst[b++],
    healHp_: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    moveSpeed_: skillParam_gen.passive1[p1++][0], //+10% move speed
    stamRed_: skillParam_gen.passive1[p1++][0], //Stamina consumption reduced by 10%
  },
  passive2: {
    atkRed_: skillParam_gen.passive1[p2++][0], //Opponents inside burst -10% attack
    duration: skillParam_gen.passive1[p2++][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    icyPawDmg_: skillParam_gen.constellation2[0], //Icy Paws +15% dmg
    icyPawShield_: skillParam_gen.constellation2[1], //Icy paws +15% shield
    coopShield_: skillParam_gen.constellation2[2], //Coop shield 50% of total shield
    coopShieldDuration_: skillParam_gen.constellation2[3], //Coop shield lasts for 5s
  },
  constellation6: {
    healingBonus_: skillParam_gen.constellation6[0],
    emBonus: skillParam_gen.constellation6[1],
  },
} as const

const [condC6Path, condC6] = cond(key, "Constellation6")
const [condA1Path, condA1] = cond(key, "Ascension1")

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
const nodeC2skillDmg_ = greaterEq(input.constellation, 2, percent(datamine.constellation2.icyPawDmg_))

// Hold shield bonus is a separate multiplier
const holdSkillShieldStr_ = percent(1.75)
// C2 Shield bonus modifies everything at the very end, it's not a shield strength bonus
// 100% if not C2, 175% if C2 or higher
const nodeC2shieldStr_ = sum(percent(1), greaterEq(input.constellation, 2, percent(datamine.constellation2.icyPawShield_)))
const nodeSkillShieldPress = prod(nodeC2shieldStr_, shieldNodeTalent("hp", datamine.skill.shieldHp_, datamine.skill.shieldFlat, "skill",))
const nodeSkillShieldHold = prod(nodeC2shieldStr_, holdSkillShieldStr_, shieldNodeTalent("hp", datamine.skill.shieldHp_, datamine.skill.shieldFlat, "skill"))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('cryo') } }),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    pressShield: nodeSkillShieldPress,
    pressCryoShield: shieldElement(elementKey, nodeSkillShieldPress),
    holdShield: nodeSkillShieldHold,
    holdCryoShield: shieldElement(elementKey, nodeSkillShieldHold),
    skillDmg: dmgNode("atk", datamine.skill.icyPawDmg, "skill", {}),
  },
  burst: {
    skillDmg: dmgNode("atk", datamine.burst.skillDmg, "burst"),
    fieldDmg: dmgNode("atk", datamine.burst.fieldDmg, "burst"),
    healDot: healNodeTalent("hp", datamine.burst.healHp_, datamine.burst.healBase, "burst"),
  },
}

const nodeA1MoveSpeed = equal(condA1, "on", percent(datamine.passive1.moveSpeed_),)
const nodeA1Stamina = equal(condA1, "on", percent(datamine.passive1.stamRed_),)

const nodeC6healing_Disp = equal(condC6, "lower", percent(datamine.constellation6.healingBonus_),)
const nodeC6healing_ = equal(input.activeCharKey, target.charKey, nodeC6healing_Disp)
const nodeC6emDisp = equal(condC6, "higher", datamine.constellation6.emBonus,)
const nodeC6em = equal(input.activeCharKey, target.charKey, nodeC6emDisp)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  }, premod: {
    skill_dmg_: nodeC2skillDmg_,
  }, teamBuff: {
    premod: {
      staminaDec_: nodeA1Stamina,
      moveSPD_: nodeA1MoveSpeed,
      eleMas: nodeC6em,
      incHeal_: nodeC6healing_,
    }
  }
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
        node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.6` }),
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
        node: infoMut(dmgFormulas.skill.pressShield, { key: `sheet:dmgAbsorption.none` }),
      }, {
        node: infoMut(dmgFormulas.skill.pressCryoShield, { key: `sheet:dmgAbsorption.cryo` }),
      }, {
        node: infoMut(dmgFormulas.skill.holdShield, { key: `char_${key}:holdShield` }),
      }, {
        node: infoMut(dmgFormulas.skill.holdCryoShield, { key: `char_${key}:holdCryoShield` }),
      }, {
        node: infoMut(dmgFormulas.skill.skillDmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: trm("skillDuration"),
        value: data => datamine.skill.duration[data.get(input.total.skillIndex).value],
        unit: "s",
        fixed: 1,
      }, {
        text: tr(`skill.skillParams.3`),
        value: datamine.skill.cdPress,
        unit: "s"
      }, {
        text: tr(`skill.skillParams.4`),
        value: datamine.skill.cdHold,
        unit: "s",
      }],
    }, ct.conditionalTemplate("passive1", {
      teamBuff: true,
      value: condA1,
      path: condA1Path,
      name: trm(`a1shielded`),
      states: {
        on: {
          fields: [{
            node: nodeA1MoveSpeed,
          }, {
            node: nodeA1Stamina,
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.skillDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.fieldDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.burst.healDot, { key: `char_${key}_gen:burst.skillParams.2` }),
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cd,
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("constellation6", {
      teamBuff: true,
      value: condC6,
      path: condC6Path,
      name: st("activeCharField"),
      states: {
        lower: {
          name: st("lessEqPercentHP", { percent: 50 }),
          fields: [{
            node: infoMut(nodeC6healing_Disp, { key: "incHeal_" }),
          }]
        },
        higher: {
          name: st("greaterPercentHP", { percent: 50 }),
          fields: [{
            node: infoMut(nodeC6emDisp, { key: "eleMas" }),
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [{ fields: [{ node: nodeC2skillDmg_ }] }]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets);
