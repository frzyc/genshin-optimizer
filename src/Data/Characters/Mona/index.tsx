import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, lookup, percent, prod, subscript } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, sprint, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Mona"
const elementKey: ElementKey = "hydro"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, sp = 0, p1 = 0, p2 = 0
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dot: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bubbleDuration: skillParam_gen.burst[b++][0],
    dmg: skillParam_gen.burst[b++],
    dmgBonusNeg: skillParam_gen.burst[b++],
    omenDuration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    dmgBonus: skillParam_gen.burst[b++],
  },
  sprint: {
    active_stam: skillParam_gen.sprint[sp++][0],
    drain_stam: skillParam_gen.sprint[sp++][0],
  },
  passive1: {
    torrentDuration: skillParam_gen.passive1[p1++][0],
    phantomDuration: skillParam_gen.passive1[p1++][0],
    percentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    unknown: skillParam_gen.passive2[p2++][0], // what is this?
    percentage: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    electroChargeDmgInc: skillParam_gen.constellation1[0],
    vaporizeDmgInc: skillParam_gen.constellation1[1],
    hydroSwirlDmgInc: skillParam_gen.constellation1[2],
    frozenExtension: skillParam_gen.constellation1[3],
    unknown: skillParam_gen.constellation1[4], // what is this?
    duration: skillParam_gen.constellation1[5],
  },
  constellation4: {
    critRateIncNeg: Math.abs(skillParam_gen.constellation4[0]), // why do they even keep this as a negative??
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0], // what is this?
    dmgBonus: skillParam_gen.constellation6[1],
    maxDmgBonus: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
  }
} as const

const hydro_dmg_ = greaterEq(input.asc, 4, prod(input.premod.enerRech_, percent(datamine.passive2.percentage)))

const [condOmenPath, condOmen] = cond(key, "Omen")
const all_dmg_ = equal("on", condOmen, subscript(input.total.burstIndex, datamine.burst.dmgBonus, { key: "_" }))

const [condPoSPath, condPoS] = cond(key, "ProphecyOfSubmersion")
const electrocharged_dmg_ = greaterEq(input.constellation, 1, equal("on", condPoS, percent(datamine.constellation1.electroChargeDmgInc)))
const swirl_dmg_ = greaterEq(input.constellation, 1, equal("on", condPoS, percent(datamine.constellation1.hydroSwirlDmgInc)))
const vaporize_dmg_ = greaterEq(input.constellation, 1, equal("on", condPoS, percent(datamine.constellation1.vaporizeDmgInc)))

const [condPoOPath, condPoO] = cond(key, "ProphecyOfOblivion")
const critRate_ = greaterEq(input.constellation, 4, equal("on", condPoO, percent(datamine.constellation4.critRateIncNeg)))

const [condRoCPath, condRoC] = cond(key, "RhetoricsOfCalamitas")
const charged_dmg_ = greaterEq(input.constellation, 6, lookup(condRoC, objectKeyMap(range(1, 3), i => percent(i * datamine.constellation6.dmgBonus)), 0))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    dot: dmgNode("atk", datamine.skill.dot, "skill"),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill")
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst")
  },
  passive1: {
    dmg: prod(dmgNode("atk", datamine.skill.dmg, "skill"), percent(datamine.passive1.percentage))
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    charged_dmg_,
    hydro_dmg_,
  },
  teamBuff: {
    premod: {
      all_dmg_,
      electrocharged_dmg_,
      swirl_dmg_,
      vaporize_dmg_,
      critRate_
    }
  }
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
            node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.4` })
          }, {
            text: tr("auto.skillParams.5"),
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
        node: infoMut(dmgFormulas.skill.dot, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: datamine.skill.cd,
        unit: "s",
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        text: trm("bubbleDuration"),
        value: datamine.burst.bubbleDuration,
        unit: "s",
      }, {
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.1` })
      }, {
        text: sgt("cd"),
        value: datamine.burst.cd,
        unit: "s",
      }, {
        text: sgt("energyCost"),
        value: datamine.burst.enerCost,
      }], {
        value: condOmen,
        path: condOmenPath,
        teamBuff: true,
        name: trm("omen"),
        states: {
          on: {
            fields: [{
              node: all_dmg_,
            }, {
              text: trm("omenDuration"),
              value: (data) => datamine.burst.omenDuration[data.get(input.total.burstIndex).value],
              unit: "s",
            }]
          }
        }
      }),
      sprint: talentTemplate("sprint", tr, sprint, [{
        text: "Activation Stamina Consumption",
        value: datamine.sprint.active_stam,
      }, {
        text: "Stamina Drain",
        value: datamine.sprint.drain_stam,
        unit: "/s",
      }]),
      passive1: talentTemplate("passive1", tr, passive1, [{
        canShow: data => data.get(input.asc).value >= 1,
        node: infoMut(dmgFormulas.passive1.dmg, { key: `char_${key}_gen:skill.skillParams.1` })
      }, {
        canShow: data => data.get(input.asc).value >= 1,
        text: trm("phantomDuration"),
        value: datamine.passive1.phantomDuration,
        unit: "s"
      }]),
      passive2: talentTemplate("passive2", tr, passive2, [{
        node: hydro_dmg_
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, undefined, {
        value: condPoS,
        path: condPoSPath,
        teamBuff: true,
        canShow: greaterEq(input.constellation, 1, 1),
        name: trm("hitOp.affectedByOmen"),
        states: {
          on: {
            fields: [{
              node: electrocharged_dmg_,
            }, {
              node: swirl_dmg_,
            }, {
              node: vaporize_dmg_,
            }, {
              text: trm("frozenDuration"),
              value: datamine.constellation1.frozenExtension * 100, // Convert to percentage
              unit: "%",
            }]
          }
        }
      }),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, undefined, {
        value: condPoO,
        path: condPoOPath,
        teamBuff: true,
        canShow: greaterEq(input.constellation, 4, 1),
        name: trm("hitOp.affectedByOmen"),
        states: {
          on: {
            fields: [{
              node: critRate_,
            }]
          }
        }
      }),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        value: condRoC,
        path: condRoCPath,
        canShow: greaterEq(input.constellation, 6, 1),
        name: trm("uponSprint"),
        states: Object.fromEntries(range(1, 3).map(i => [i, {
          name: st("stack", { count: i }),
          fields: [
            { node: charged_dmg_ },
            {
              text: sgt("duration"),
              value: datamine.constellation6.duration,
              unit: 's'
            }]
        }]))
      })
    },
  },
};
export default new CharacterSheet(sheet, data);
