import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, percent, prod, subscript, sum } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Amber"
const elementKey: ElementKey = "pyro"
const region: Region = "mondstadt"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++]
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++]
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    unknown: skillParam_gen.skill[s++], // what is this??
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgPerWave: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    rainDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0]
  },
  passive1: {
    critRateInc: skillParam_gen.passive1[p1++][0],
    aoeInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    atkInc: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    secArrowDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    manualDetionationDmg: skillParam_gen.constellation2[0],
  },
  constellation6: {
    moveSpdInc: skillParam_gen.constellation6[0],
    atkInc: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2]
  }
} as const

const burst_critRate_ = greaterEq(input.asc, 1, percent(datamine.passive1.critRateInc))
const [condA4Path, condA4] = cond(key, "A4")
const atk_ = equal("on", condA4, percent(datamine.passive2.atkInc))

const [condC6Path, condC6] = cond(key, "C6")
const moveSPD_ = equal("on", condC6, percent(datamine.constellation6.moveSpdInc))
const teamAtk_ = equal("on", condC6, percent(datamine.constellation6.atkInc))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    aimed: dmgNode("atk", datamine.charged.aimed, "charged"),
    aimedCharged: dmgNode("atk", datamine.charged.aimedCharged, "charged", { hit: { ele: constant('pyro') } }),
    secondAimed: greaterEq(input.constellation, 1, prod(percent(datamine.constellation1.secArrowDmg), dmgNode("atk", datamine.charged.aimed, "charged"))),
    secondAimedCharged: greaterEq(input.constellation, 1, prod(dmgNode("atk", datamine.charged.aimedCharged, "charged",
      { hit: { ele: constant('pyro') } }), percent(datamine.constellation1.secArrowDmg))),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    inheritedHp: prod(subscript(input.total.skillIndex, datamine.skill.inheritedHp), input.total.hp),
    dmg: dmgNode("atk", datamine.skill.dmg, "skill"),
  },
  burst: {
    rainDmg: dmgNode("atk", datamine.burst.rainDmg, "burst"),
    dmgPerWave: dmgNode("atk", datamine.burst.dmgPerWave, "burst"),
  },
  constellation2: {
    manualDetonationDmg: greaterEq(input.constellation, 2, dmgNode("atk", datamine.skill.dmg, "skill", { premod: { skill_dmg_: percent(datamine.constellation2.manualDetionationDmg) } })),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, region, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    atk_,
    burst_critRate_,
  },
  teamBuff: {
    premod: {
      moveSPD_,
      atk_: teamAtk_
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
      auto: talentTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), undefined, undefined, [{
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey),
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        ),
        text: tr("auto.fields.normal")
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.charged.aimed, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          node: infoMut(dmgFormulas.charged.secondAimed, { key: `char_${key}_gen:auto.skillParams.5` }),
          textSuffix: trm("secondArrow")
        }, {
          node: infoMut(dmgFormulas.charged.aimedCharged, { key: `char_${key}_gen:auto.skillParams.6` }),
        }, {
          node: infoMut(dmgFormulas.charged.secondAimedCharged, { key: `char_${key}_gen:auto.skillParams.6` }),
          textSuffix: trm("secondArrow")
        },]),
        text: tr("auto.fields.charged"),
      }, {
        ...sectionTemplate("auto", tr, normalSrc(data_gen.weaponTypeKey), [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, skill, [{
        node: infoMut(dmgFormulas.skill.inheritedHp, { key: `char_${key}_gen:skill.skillParams.0`, variant: "success" }),
      }, {
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.constellation2.manualDetonationDmg, { key: `char_${key}:manualDetonationDmg` }),
      }, {
        text: tr("skill.skillParams.2"),
        value: (data) => data.get(input.constellation).value >= 4 ? datamine.skill.cd - datamine.skill.cd * 0.2 : datamine.skill.cd,
        unit: "s"
      }, {
        canShow: (data) => data.get(input.constellation).value >= 4,
        text: st("charges"),
        value: 2,
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmgPerWave, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.rainDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        text: tr("burst.skillParams.2"),
        value: datamine.burst.duration,
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: `${datamine.burst.enerCost}`,
      }], undefined, [sectionTemplate("constellation6", tr, c6, undefined, {
        value: condC6,
        path: condC6Path,
        canShow: greaterEq(input.constellation, 6, 1),
        name: trm("c6CondName"),
        teamBuff: true,
        states: {
          on: {
            fields: [{
              node: teamAtk_
            }, {
              node: moveSPD_
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: "s"
            }]
          }
        }
      })]),
      passive1: talentTemplate("passive1", tr, passive1, [{
        canShow: (data) => data.get(input.asc).value >= 1,
        text: trm("critRateBonus"),
        value: datamine.passive1.critRateInc * 100,
        unit: "%"
      }, {
        canShow: (data) => data.get(input.asc).value >= 1,
        text: trm("aoeRangeBonus"),
        value: datamine.passive1.aoeInc * 100,
        unit: "%"
      }, {
        node: burst_critRate_
      },]),
      passive2: talentTemplate("passive2", tr, passive2, undefined, {
        value: condA4,
        path: condA4Path,
        canShow: greaterEq(input.asc, 4, 1),
        name: trm("a4CondName"),
        states: {
          on: {
            fields: [{
              node: atk_
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: "s"
            }]
          }
        }
      }),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
