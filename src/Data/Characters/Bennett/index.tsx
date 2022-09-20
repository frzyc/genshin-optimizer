import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { UIData } from '../../../Formula/uiData'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Bennett"
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
      skillParam_gen.auto[a++], // 5
    ]
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold1_1: skillParam_gen.skill[s++],
    hold1_2: skillParam_gen.skill[s++],
    hold2_1: skillParam_gen.skill[s++],
    hold2_2: skillParam_gen.skill[s++],
    explosion: skillParam_gen.skill[s++],
    cd_press: skillParam_gen.skill[s++][0],
    cd_hold1: skillParam_gen.skill[s++][0],
    cd_hold2: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    regen_: skillParam_gen.burst[b++],
    regenFlat: skillParam_gen.burst[b++],
    atkBonus: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd_red: 0.2, // Not in the datamine for some reason
  },
  passive2: {
    cd_red: 0.5, // Not in the datamine for some reason
  },
  constellation1: {
    atk_inc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    hp_thresh: skillParam_gen.constellation2[0],
    er_inc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    pyro_dmg: skillParam_gen.constellation6[0],
  }
} as const

const a1SkillCd = greaterEq(input.asc, 1, datamine.passive1.cd_red)

const burstAtkRatio = subscript(input.total.burstIndex, datamine.burst.atkBonus, { key: "_" })
const burstAddlAtk = prod(burstAtkRatio, input.base.atk)
const c1AtkRatio = greaterEq(input.constellation, 1, datamine.constellation1.atk_inc, { key: `char_${key}:additionalATKRatio_` })
const c1AddlAtk = greaterEq(input.constellation, 1, prod(c1AtkRatio, input.base.atk))
const atkIncRatio = sum(burstAtkRatio, c1AtkRatio)
const activeInAreaAtkDisp = prod(atkIncRatio, input.base.atk)

const [condInAreaPath, condInArea] = cond(key, "activeInArea")
const activeInArea = equal("activeInArea", condInArea, equal(input.activeCharKey, target.charKey, 1))
const activeInAreaAtk = equal(activeInArea, 1, activeInAreaAtkDisp)

const activeInAreaA4 = greaterEq(input.asc, 4,
  equal(activeInArea, 1, datamine.passive2.cd_red)
)

const c6AndCorrectWep = greaterEq(input.constellation, 6,
  lookup(target.weaponType,
    { "sword": constant(1), "claymore": constant(1), "polearm": constant(1) }, constant(0)))
const activeInAreaC6PyroDmg = equal(activeInArea, 1,
  greaterEq(input.constellation, 6, datamine.constellation6.pyro_dmg)
)
const activeInAreaC6Infusion = equalStr(c6AndCorrectWep, 1, equalStr(activeInArea, 1, elementKey))

const [condUnderHPPath, condUnderHP] = cond(key, "underHP")
const underHP = greaterEq(input.constellation, 2,
  equal("underHP", condUnderHP, datamine.constellation2.er_inc))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.dmg2, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold1_1: dmgNode("atk", datamine.skill.hold1_1, "skill"),
    hold1_2: dmgNode("atk", datamine.skill.hold1_2, "skill"),
    hold2_1: dmgNode("atk", datamine.skill.hold2_1, "skill"),
    hold2_2: dmgNode("atk", datamine.skill.hold2_2, "skill"),
    explosion: dmgNode("atk", datamine.skill.explosion, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    regen: healNodeTalent("hp", datamine.burst.regen_, datamine.burst.regenFlat, "burst"),
    atkInc: activeInAreaAtk,
  },
  constellation4: {
    dmg: greaterEq(input.constellation, 4, prod(dmgNode("atk", datamine.skill.hold1_2, "skill"), datamine.constellation4.dmg))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  teamBuff: {
    premod: {
      pyro_dmg_: activeInAreaC6PyroDmg,
    },
    total: {
      // Not 100% sure if this should be in premod or total
      atk: activeInAreaAtk,
    },
    infusion: {
      team: activeInAreaC6Infusion,
    },
  },
  premod: {
    enerRech_: underHP,

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
  talent: {
    auto: ct.talentTemplate("auto", [{
      text: tr("auto.fields.normal"),
    }, {
      fields: datamine.normal.hitArr.map((_, i) => ({
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
      })),
    }, {
      text: tr("auto.fields.charged"),
    }, {
      fields: [{
        node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.5` }),
        textSuffix: "(2)"
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
        // Press
        node: infoMut(dmgFormulas.skill.press, { key: `char_${key}:skill.pressDMG` }),
      }, {
        text: sgt("press.cd"),
        unit: "s",
        value: data => calculateSkillCD(data, datamine.skill.cd_press),
      }, {
        // Lvl 1
        node: infoMut(dmgFormulas.skill.hold1_1, { key: `char_${key}:skill.lvl1_1DMG` }),
      }, {
        node: infoMut(dmgFormulas.skill.hold1_2, { key: `char_${key}:skill.lvl1_2DMG` }),
      }, {
        text: trm("skill.lvl1CD"),
        unit: "s",
        value: data => calculateSkillCD(data, datamine.skill.cd_hold1),
      }, {
        // Lvl 2
        node: infoMut(dmgFormulas.skill.hold2_1, { key: `char_${key}:skill.lvl2_1DMG` }),
      }, {
        node: infoMut(dmgFormulas.skill.hold2_2, { key: `char_${key}:skill.lvl2_2DMG` }),
      }, {
        node: infoMut(dmgFormulas.skill.explosion, { key: `char_${key}:skill.explDMG` }),
      }, {
        text: trm("skill.lvl2CD"),
        unit: "s",
        value: data => calculateSkillCD(data, datamine.skill.cd_hold2),
      }]
    }, ct.headerTemplate("passive1", {
      fields: [{
        node: infoMut(a1SkillCd, { key: "skillCDRed_" })
      }],
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.regen, { key: `char_${key}_gen:burst.skillParams.1` })
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.duration,
        unit: "s",
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: tr("burst.skillParams.5"),
        value: datamine.burst.enerCost,
      }]
    }, ct.conditionalTemplate("burst", {
      value: condInArea,
      path: condInAreaPath,
      name: st("activeCharField"),
      teamBuff: true,
      states: {
        activeInArea: {
          fields: [{
            text: tr("burst.skillParams.2"),
            value: data => data.get(burstAtkRatio).value * 100,
            unit: "%",
            fixed: 1
          }, {
            node: infoMut(burstAddlAtk, { key: `sheet:increase.atk` })
          }]
        }
      }
    }), ct.headerTemplate("passive2", {
      fields: [{
        node: infoMut(activeInAreaA4, { key: "skillCDRed_" })
      }],
      canShow: equal(condInArea, "activeInArea", 1),
    }), ct.headerTemplate("constellation1", {
      fields: [{
        text: trm("additionalATKRatio"),
        node: c1AtkRatio
      }, {
        node: infoMut(c1AddlAtk, { key: `char_${key}:additionalATK` })
      }],
      canShow: equal(condInArea, "activeInArea", 1),
      teamBuff: true,
    }), ct.headerTemplate("constellation6", {
      fields: [{
        node: constant(datamine.constellation6.pyro_dmg, { key: "pyro_dmg_", variant: "pyro" })
      }, {
        text: trm("c6PyroInfusion")
      }],
      canShow: equal(condInArea, "activeInArea", 1),
      teamBuff: true,
    })]),
    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2", [
      ct.conditionalTemplate("constellation2", {
        value: condUnderHP,
        path: condUnderHPPath,
        name: st("lessPercentHP", { percent: datamine.constellation2.hp_thresh * 100 }),
        states: {
          underHP: {
            fields: [{
              node: underHP
            }]
          }
        }
      }),
    ]),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
    constellation4: ct.talentTemplate("constellation4", [ct.fieldsTemplate("constellation4", {
      fields: [{
        node: infoMut(dmgFormulas.constellation4.dmg, { key: `char_${key}:c4DMG` })
      }],
    })]),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  }
}

export default new CharacterSheet(sheet, data, assets);

function calculateSkillCD(data: UIData, skillCD: number): string {
  let cdFactor: number = 1.00;
  let result: string = skillCD + "s"
  if (data.get(input.asc).value >= 1) {
    cdFactor = 0.80;
  }
  cdFactor *= (1 - data.get(activeInAreaA4).value);
  if (cdFactor !== 1.00) {
    result += " - " + (100 - cdFactor * 100) + "% = " + skillCD * cdFactor;
  }
  return result;
}
