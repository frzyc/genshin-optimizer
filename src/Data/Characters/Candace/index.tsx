import { CharacterData } from 'pipeline'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, percent, prod, sum, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, shieldElement, shieldNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Candace"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
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
    shield_hp_: skillParam_gen.skill[s++],
    shield_base: skillParam_gen.skill[s++],
    basic_dmg: skillParam_gen.skill[s++],
    charged_dmg: skillParam_gen.skill[s++],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skill_dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    dmg_bonus_: skillParam_gen.burst[b++][0],
    wave_dmg: skillParam_gen.burst[b++],
    num_waves: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive2: {
    normalEle_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    durationInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    hp_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const [condAfterBurstPath, condAfterBurst] = cond(key, "afterBurst")
const normalEle_dmg_ = equal(condAfterBurst, "on", percent(datamine.burst.dmg_bonus_), { key: "normalEle_dmg_" })

const hydroInfusion = equalStr(condAfterBurst, "on",
  lookup(target.weaponType,
    { "sword": constant("hydro"), "claymore": constant("hydro"), "polearm": constant("hydro") }, constant("")))

const a4_normalEle_dmg_ = greaterEq(input.asc, 4, equal(condAfterBurst, "on",
  prod(
    percent(datamine.passive2.normalEle_dmg_),
    input.total.hp,
    1 / 1000
  )
), { key: "normalEle_dmg_" })

const [condC2AfterSkillHitPath, condC2AfterSkillHit] = cond(key, "c2AfterSkillHit")
const c2_hp_ = greaterEq(input.constellation, 2,
  equal(condC2AfterSkillHit, "on", percent(datamine.constellation2.hp_))
)

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    shield: shieldNodeTalent("hp", datamine.skill.shield_hp_, datamine.skill.shield_base, "skill"),
    hydroShield: shieldElement("hydro", shieldNodeTalent("hp", datamine.skill.shield_hp_, datamine.skill.shield_base, "skill")),
    basicDmg: dmgNode("hp", datamine.skill.basic_dmg, "skill"),
    chargedDmg: dmgNode("hp", datamine.skill.charged_dmg, "skill"),
  },
  burst: {
    skillDmg: dmgNode("hp", datamine.burst.skill_dmg, "burst"),
    waveDmg: dmgNode("hp", datamine.burst.wave_dmg, "burst"),
  },
  passive2: {
    normalEle_dmg_: a4_normalEle_dmg_
  },
  constellation6: {
    dmg: greaterEq(input.constellation, 6, customDmgNode(
      prod(
        datamine.constellation6.dmg,
        input.total.hp
      ), "burst"
    ))
  }
}

const burstC3 = greaterEq(input.constellation, 3, 3)
const skillC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "sumeru", data_gen, dmgFormulas, {
  bonus: {
    burst: burstC3,
    skill: skillC5,
  },
  premod: {
    hp_: c2_hp_,
  },
  teamBuff: {
    premod: {
      normalEle_dmg_: sum(normalEle_dmg_, a4_normalEle_dmg_)
    },
    infusion: {
      team: hydroInfusion,
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
        node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i + (i < 3 ? 0 : -1)}` }),
        textSuffix: i === 2 || i === 3 ? `(${i - 1})` : ""
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
        node: infoMut(dmgFormulas.skill.shield, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.hydroShield, { key: `sheet:dmgAbsorption.hydro` }),
      }, {
        node: infoMut(dmgFormulas.skill.basicDmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.skill.chargedDmg, { key: `char_${key}_gen:skill.skillParams.2` }),
      }, {
        text: st("pressCD"),
        value: datamine.skill.pressCd,
        unit: 's'
      }, {
        text: st("holdCD"),
        value: (data) => data.get(input.constellation).value >= 4
          ? datamine.skill.pressCd
          : datamine.skill.holdCd,
        unit: 's'
      }]
    }, ct.conditionalTemplate("constellation2", {
      // Personal conditional
      path: condC2AfterSkillHitPath,
      value: condC2AfterSkillHit,
      name: st("hitOp.skill"),
      states: {
        on: {
          fields: [{
            node: c2_hp_
          }, {
            text: sgt("duration"),
            value: datamine.constellation2.duration,
            unit: "s"
          }]
        }
      }
    })]),

    burst: ct.talentTemplate("burst", [{
      fields: [{
        node: infoMut(dmgFormulas.burst.skillDmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.waveDmg, { key: `char_${key}_gen:burst.skillParams.3` })
      }, {
        text: tr("burst.skillParams.4"),
        value: datamine.burst.num_waves,
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.cost,
      }]
    }, ct.conditionalTemplate("burst", {
      path: condAfterBurstPath,
      value: condAfterBurst,
      teamBuff: true,
      name: st("afterUse.burst"),
      states: {
        on: {
          fields: [{
            node: normalEle_dmg_,
          }, {
            text: trm("hydroInfusion")
          }, {
            text: sgt("duration"),
            value: (data) => data.get(input.constellation).value >= 1
              ? `${datamine.burst.duration}s + ${datamine.constellation1.durationInc}s = ${datamine.burst.duration + datamine.constellation1.durationInc}`
              : datamine.burst.duration,
            unit: "s"
          }]
        }
      }
    }), ct.headerTemplate("passive2", {
      teamBuff: true,
      canShow: equal(condAfterBurst, "on", 1),
      fields: [{
        node: a4_normalEle_dmg_
      }]
    }), ct.headerTemplate("constellation6", {
      fields: [{
        node: infoMut(dmgFormulas.constellation6.dmg, { key: `char_${key}_gen:burst.skillParams.3` })
      }]
    }), ct.conditionalTemplate("constellation2", {
      // Team conditional
      path: condC2AfterSkillHitPath,
      value: condC2AfterSkillHit,
      name: st("hitOp.skill"),
      teamBuff: true,
      canShow: unequal(input.activeCharKey, key, greaterEq(input.asc, 4, equal(condAfterBurst, "on", 1))),
      states: {
        on: {
          fields: [{
            node: c2_hp_
          }, {
            text: sgt("duration"),
            value: datamine.constellation2.duration,
            unit: "s"
          }]
        }
      }
    })]),

    passive1: ct.talentTemplate("passive1"),
    passive2: ct.talentTemplate("passive2"),
    passive3: ct.talentTemplate("passive3"),
    constellation1: ct.talentTemplate("constellation1"),
    constellation2: ct.talentTemplate("constellation2"),
    constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: burstC3 }] }]),
    constellation4: ct.talentTemplate("constellation4"),
    constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: skillC5 }] }]),
    constellation6: ct.talentTemplate("constellation6"),
  },
}
export default new CharacterSheet(sheet, data, assets)
