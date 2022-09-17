import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { charTemplates, ICharacterSheet } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import assets from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "SangonomiyaKokomi"
const elementKey: ElementKey = "hydro"
const [tr, trm] = trans("char", key)
const ct = charTemplates(key, data_gen.weaponTypeKey, assets)

let a = 0, s = 0, b = 0, c6i = 0
const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    heal_: skillParam_gen.skill[s++],
    heal: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    heal_: skillParam_gen.burst[b++],
    heal: skillParam_gen.burst[b++],
    nBonus_: skillParam_gen.burst[b++],
    cBonus_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    sBonus_: skillParam_gen.burst[b++],
  },
  p: {
    heal_: 0.25,
    critRate_: -1
  },
  p2: {
    heal_ratio_: skillParam_gen.passive2[0][0],
  },
  c1: {
    hp_: skillParam_gen.constellation1[0],
  },
  c2: {
    s_heal_: skillParam_gen.constellation2[1],
    nc_heal_: skillParam_gen.constellation2[2],
  },
  c4: {
    atkSPD_: skillParam_gen.constellation4[0],
    energy: skillParam_gen.constellation4[1]
  },
  c6: {
    hp_: skillParam_gen.constellation6[c6i++],
    hydro_: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++]
  },
} as const

const [condBurstPath, condBurst] = cond(key, "burst")
const [condC2Path, condC2] = cond(key, "c2")
const [condC6Path, condC6] = cond(key, "c6")

const burstNormalDmgInc = equal(condBurst, "on", prod(
  sum(
    subscript(input.total.burstIndex, datamine.burst.nBonus_, { key: '_' }),
    greaterEq(input.asc, 4, prod(percent(datamine.p2.heal_ratio_), input.premod.heal_)),
  ),
  input.premod.hp), { variant: "invalid" })
const burstChargedDmgInc = equal(condBurst, "on", prod(
  sum(
    subscript(input.total.burstIndex, datamine.burst.cBonus_, { key: '_' }),
    greaterEq(input.asc, 4, prod(percent(datamine.p2.heal_ratio_), input.premod.heal_)),
  ),
  input.premod.hp), { variant: "invalid" })
const burstSkillDmgInc = equal(condBurst, "on", prod(
  subscript(input.total.burstIndex, datamine.burst.sBonus_, { key: '_' }),
  input.premod.hp))

const passiveHeal_ = constant(datamine.p.heal_)
const passiveCritRate_ = constant(datamine.p.critRate_)
const c2SkillHeal = greaterEq(input.constellation, 2,
  equal(condC2, "on",
    prod(percent(datamine.c2.s_heal_), input.total.hp)
  )
)
const c2BurstHeal = greaterEq(input.constellation, 2,
  equal(condC2, "on",
    prod(percent(datamine.c2.nc_heal_), input.total.hp)
  )
)
const c4AtkSpd_ = greaterEq(input.constellation, 4, datamine.c4.atkSPD_)
const c6Hydro_ = greaterEq(input.constellation, 6, equal(condC6, "on", datamine.c6.hydro_))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
    heal: healNodeTalent("hp", datamine.skill.heal_, datamine.skill.heal, "skill",
      { premod: { healInc: c2SkillHeal } }
    )
  },
  burst: {
    dmg: dmgNode("hp", datamine.burst.dmg, "burst"),
    heal: healNodeTalent("hp", datamine.burst.heal_, datamine.burst.heal, "burst",
      { premod: { healInc: c2BurstHeal } }
    )
  },
  constellation1: {
    dmg: greaterEq(input.constellation, 1, customDmgNode(prod(input.total.hp, percent(datamine.c1.hp_)), "elemental", {
      hit: { ele: constant(elementKey) }
    }))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    heal_: passiveHeal_,
    critRate_: passiveCritRate_,
    atkSPD_: c4AtkSpd_,
    hydro_dmg_: c6Hydro_,
    // TODO: below should be for `total`
    normal_dmgInc: burstNormalDmgInc,
    charged_dmgInc: burstChargedDmgInc,
    skill_dmgInc: burstSkillDmgInc,
  },
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
  talent: {  auto: ct.talentTemplate("auto", [{
        text: tr("auto.fields.normal"),
      }, {
        fields: datamine.normal.hitArr.map((_, i) => ({
          node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
        }))
      }, {
        text: tr("auto.fields.charged"),
      }, {
        fields: [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.3` })
        }, {
          text: tr("auto.skillParams.4"),
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
          node: infoMut(dmgFormulas.skill.heal, { key: `char_${key}_gen:skill.skillParams.0` }),
        }, {
          node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
        }, {
          text: tr("skill.skillParams.2"),
          value: datamine.skill.duration,
          unit: "s"
        }, {
          text: tr("skill.skillParams.3"),
          value: datamine.skill.cd,
          unit: "s"
        }]
      }]),

      burst: ct.talentTemplate("burst", [{
        fields: [{
          node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
        }, {
          text: tr("burst.skillParams.6"),
          value: datamine.burst.cd,
          unit: "s"
        }, {
          text: tr("burst.skillParams.7"),
          value: datamine.burst.enerCost,
        }]
      }, ct.conditionalTemplate("burst", {
        value: condBurst,
        path: condBurstPath,
        name: trm("burst"),
        states: {
          on: {
            fields: [{
              node: burstNormalDmgInc,
            }, {
              node: burstChargedDmgInc,
            }, {
              node: burstSkillDmgInc,
            }, {
              node: infoMut(dmgFormulas.burst.heal, { key: `char_${key}_gen:burst.skillParams.4`, variant: "heal" }),
            }, {
              text: tr("burst.skillParams.5"),
              value: datamine.burst.duration,
              unit: "s"
            }]
          }
        }
      })]),

      passive: ct.talentTemplate("passive", [{
        fields: [{
          node: passiveHeal_
        }, {
          node: passiveCritRate_
        }]
      }]),
      passive1: ct.talentTemplate("passive1"),
      passive2: ct.talentTemplate("passive2"),
      passive3: ct.talentTemplate("passive3"),
      constellation1: ct.talentTemplate("constellation1", [ct.fieldsTemplate("constellation1", {
        fields: [{
          node: infoMut(dmgFormulas.constellation1.dmg, { key: "sheet:dmg" })
        }]
      })]),
      constellation2: ct.talentTemplate("constellation2", [ct.conditionalTemplate("constellation2", {
        path: condC2Path,
        value: condC2,
        name: trm("c2"),
        states: {
          on: {
            fields: [{
              node: infoMut(c2SkillHeal, { key: `char_${key}:c2SkillHeal` }),
            }, {
              node: infoMut(c2BurstHeal, { key: `char_${key}:c2BurstHeal` }),
            }]
          }
        }
      })]),
      constellation3: ct.talentTemplate("constellation3", [{ fields: [{ node: nodeC3 }] }]),
      constellation4: ct.talentTemplate("constellation4", [{ fields: [{ node: c4AtkSpd_ }] }]),
      constellation5: ct.talentTemplate("constellation5", [{ fields: [{ node: nodeC5 }] }]),
      constellation6: ct.talentTemplate("constellation6", [ct.conditionalTemplate("constellation6", {
        path: condC6Path,
        value: condC6,
        name: trm("c6"),
        states: {
          on: { fields: [{ node: c6Hydro_ }] }
        }
      })]),
    },
  }
export default new CharacterSheet(sheet, data, assets)
