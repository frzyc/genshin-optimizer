import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, customHealNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "SangonomiyaKokomi"
const elementKey: ElementKey = "hydro"
const [tr, trm] = trans("char", key)

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
  input.premod.hp))
const burstChargedDmgInc = equal(condBurst, "on", prod(
  sum(
    subscript(input.total.burstIndex, datamine.burst.cBonus_, { key: '_' }),
    greaterEq(input.asc, 4, prod(percent(datamine.p2.heal_ratio_), input.premod.heal_)),
  ),
  input.premod.hp))
const burstSkillDmgInc = equal(condBurst, "on", prod(
  subscript(input.total.burstIndex, datamine.burst.sBonus_, { key: '_' }),
  input.premod.hp))

const passiveHeal_ = constant(datamine.p.heal_)
const passiveCritRate_ = constant(datamine.p.critRate_)
const c4AtkSpd_ = greaterEq(input.constellation, 4, constant(datamine.c4.atkSPD_))
const c6Hydro_ = greaterEq(input.constellation, 6, equal(condC6, "on", constant(datamine.c6.hydro_)))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    heal: customHealNode(sum(
      prod(sum(
        subscript(input.total.skillIndex, datamine.skill.heal_, { key: '_' }),
        greaterEq(input.constellation, 2, equal(condC2, "on", percent(datamine.c2.s_heal_))),
      ), input.total.hp),
      subscript(input.total.skillIndex, datamine.skill.heal)
    )),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill")
  },
  burst: {
    dmg: dmgNode("hp", datamine.burst.dmg, "burst"),
    heal: customHealNode(sum(
      prod(sum(
        subscript(input.total.burstIndex, datamine.burst.heal_, { key: '_' }),
        greaterEq(input.constellation, 2, equal(condC2, "on", percent(datamine.c2.nc_heal_))),
      ), input.total.hp),
      subscript(input.total.burstIndex, datamine.burst.heal)
    )),
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
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.3` })
          }, {
            text: tr("auto.skillParams.4"),
            value: datamine.charged.stamina,
          }]
        }, {
          text: tr("auto.fields.plunging"),
          fields: [{
            node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
          }, {
            node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
          }, {
            node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
          }]
        }],
      },
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.heal, { key: `char_${key}_gen:skill.skillParams.0`, variant: "success" }),
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
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.6"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.7"),
        value: datamine.burst.enerCost,
      }], {
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
              node: infoMut(dmgFormulas.burst.heal, { key: `char_${key}_gen:burst.skillParams.4`, variant: "success" }),
            }, {
              text: tr("burst.skillParams.5"),
              value: datamine.burst.duration,
              unit: "s"
            }]
          }
        }
      }),
      passive: talentTemplate("passive", tr, passive, [{
        node: passiveHeal_
      }, {
        node: passiveCritRate_
      }]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, [{
        node: infoMut(dmgFormulas.constellation1.dmg, { key: "sheet:dmg" })
      }]),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        path: condC2Path,
        value: condC2,
        canShow: greaterEq(input.constellation, 2, 1),
        name: trm("c2"),
        states: {
          on: {}
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, [{ node: c4AtkSpd_ }]),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        path: condC6Path,
        value: condC6,
        canShow: greaterEq(input.constellation, 6, 1),
        name: trm("c6"),
        states: {
          on: { fields: [{ node: c6Hydro_ }] }
        }
      }),
    },
  },
};
export default new CharacterSheet(sheet, data);
