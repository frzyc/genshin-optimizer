import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Xinyan"
const elementKey: ElementKey = "pyro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
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
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    shieldArr: [
      { defShield_: skillParam_gen.skill[s++], baseShield: skillParam_gen.skill[s++] },
      { defShield_: skillParam_gen.skill[s++], baseShield: skillParam_gen.skill[s++] },
      { defShield_: skillParam_gen.skill[s++], baseShield: skillParam_gen.skill[s++] },
    ],
    lvl3Dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressPhysDmg: skillParam_gen.burst[b++],
    dotPyroDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive2: {
    physical_dmg_: skillParam_gen.passive2[0][0],
  },
  c1: {
    atkSPD_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[1],
  },
  c2: {
    burstphysical_critRate_: skillParam_gen.constellation2[0],
  },
  c4: {
    physical_enemyRes_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  c6: {
    staminaChargedDec_: -skillParam_gen.constellation6[0],
    charged_atkBonus: skillParam_gen.constellation6[1]
  }
} as const

const [condSkillHitNumPath, condSkillHitNum] = cond(key, "skillHitNum")

const [condP2ShieldPath, condP2Shield] = cond(key, "p2Shield")
const p2Shield_physical_dmg_Disp = greaterEq(input.asc, 4, equal(condP2Shield, "on", datamine.passive2.physical_dmg_))
const p2Shield_physical_dmg_ = equal(input.activeCharKey, target.charKey, p2Shield_physical_dmg_Disp)

const [condC1CritPath, condC1Crit] = cond(key, "c1Crit")
const c1Crit_atkSPD_ = greaterEq(input.constellation, 1, equal(condC1Crit, "on", datamine.c1.atkSPD_))

const c2BurstPhysical_critRate_ = greaterEq(input.constellation, 2, datamine.c2.burstphysical_critRate_)

const [condC4SkillHitPath, condC4SkillHit] = cond(key, "c4Burst")
const c4SkillHit_physical_enemyRes_ = greaterEq(input.constellation, 4, equal(condC4SkillHit, "on", datamine.c4.physical_enemyRes_))

const c6_staminaChargedDec_ = greaterEq(input.constellation, 6, datamine.c6.staminaChargedDec_)
const [condC6ChargedPath, condC6Charged] = cond(key, "c6Charged")
const c6_chargedAtkBonus = greaterEq(input.constellation, 6,
  equal(condC6Charged, "on",
    prod(input.total.def, percent(datamine.c6.charged_atkBonus))
  )
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spin: dmgNode("atk", datamine.charged.spin, "charged"),
    final: dmgNode("atk", datamine.charged.final, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    ...Object.fromEntries(datamine.skill.shieldArr.map((data, i) => [
      `normShield${i + 1}`,
      shieldNodeTalent("def", data.defShield_, data.baseShield, "skill"),
    ])),
    ...Object.fromEntries(datamine.skill.shieldArr.map((data, i) => [
      `pyroShield${i + 1}`,
      shieldElement(elementKey, shieldNodeTalent("def", data.defShield_, data.baseShield, "skill"))
    ])),
    lvl3Dmg: dmgNode("atk", datamine.skill.lvl3Dmg, "skill"),
  },
  burst: {
    pressPhysDmg: dmgNode("atk", datamine.burst.pressPhysDmg, "burst", {
      hit: { ele: constant("physical") },
      premod: {
        burst_critRate_: c2BurstPhysical_critRate_,
      }
    }),
    dotPyroDmg: dmgNode("atk", datamine.burst.dotPyroDmg, "burst"),
  },
} as const

const skillC3 = greaterEq(input.constellation, 3, 3)
const burstC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: skillC3,
    burst: burstC5
  },
  teamBuff: {
    premod: {
      physical_dmg_: p2Shield_physical_dmg_,
      physical_enemyRes_: c4SkillHit_physical_enemyRes_,
    }
  },
  premod: {
    atkSPD_: c1Crit_atkSPD_,
    staminaChargedDec_: c6_staminaChargedDec_,
    atk: c6_chargedAtkBonus
  }
})

const sheet: ICharacterSheet = {
  key,
  name: tr("name"),
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal")
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      }))
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.spin, { key: `char_${key}_gen:auto.skillParams.4` }),
      }, {
        node: infoMut(dmgFormulas.charged.final, { key: `char_${key}_gen:auto.skillParams.5` }),
      }, {
        text: tr("auto.skillParams.6"),
        value: `${datamine.charged.stamina}/s`,
      }],
    }, ct.headerTemplate("constellation6", {
      fields: [{
        node: c6_staminaChargedDec_
      }]
    }), ct.conditionalTemplate("constellation6", {
      value: condC6Charged,
      path: condC6ChargedPath,
      name: trm("c6.duringCharge"),
      states: {
        on: {
          fields: [{
            node: c6_chargedAtkBonus
          }]
        }
      }
    }), {
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
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        text: sgt("cd"),
        value: datamine.skill.cd,
        unit: "s"
      }]
    }, ct.conditionalTemplate("skill", {
      value: condSkillHitNum,
      path: condSkillHitNumPath,
      name: trm("skill.shieldLevel"),
      states: Object.fromEntries(range(1, 3).map(lvl => [ // For each level
        lvl, {
          name: trm(`skill.shieldLevels.${lvl}`),
          fields: [
            ...(["norm", "pyro"] as const).flatMap(type => ([{ // For each type of shield
              node: infoMut(dmgFormulas.skill[`${type}Shield${lvl}`], // Make the node
                {
                  key: type === "norm" // And change the key to match
                    ? `char_${key}_gen:skill.skillParams.${lvl}`
                    : `char_${key}:skill.pyroShield.${lvl}`
                }
              )
            },
            ])), {
              text: sgt("duration"),
              value: datamine.skill.duration,
              unit: "s",
            },
            // Level 3 damage
            ...lvl === 3 ? [{ node: infoMut(dmgFormulas.skill.lvl3Dmg, { key: `char_${key}_gen:skill.skillParams.4` }) }] : [],
          ]
        }
      ]))
    }), ct.headerTemplate("passive1", {
      fields: [{
        text: trm("p1.desc"),
      }]
    }), ct.conditionalTemplate("passive2", {
      value: condP2Shield,
      path: condP2ShieldPath,
      name: trm("p2.activeShield"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: infoMut(p2Shield_physical_dmg_Disp, { key: "physical_dmg_" })
          }]
        }
      }
    }), ct.conditionalTemplate("constellation4", {
      value: condC4SkillHit,
      path: condC4SkillHitPath,
      name: trm("c4.swingHit"),
      teamBuff: true,
      states: {
        on: {
          fields: [{
            node: c4SkillHit_physical_enemyRes_
          }, {
            text: sgt("duration"),
            value: datamine.c4.duration,
            unit: "s",
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.pressPhysDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.dotPyroDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
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
      }]
    }, ct.headerTemplate("constellation2", {
      fields: [{
        node: infoMut(c2BurstPhysical_critRate_, { key: `char_${key}:c2.key_` }),
      }, {
        text: trm("c2.shield"),
      }]
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1", [ct.conditionalTemplate("constellation1", {
      value: condC1Crit,
      path: condC1CritPath,
      name: st("hitOp.crit"),
      states: {
        on: {
          fields: [{
            node: c1Crit_atkSPD_,
          }, {
            text: sgt("duration"),
            value: datamine.c1.duration,
            unit: "s",
          }, {
            text: sgt("cd"),
            value: datamine.c1.cd,
            unit: "s",
          }]
        }
      }
    })]),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: skillC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: burstC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets)
