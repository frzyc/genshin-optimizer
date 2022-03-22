import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, percent, prod } from '../../../Formula/utils'
import { CharacterKey, ElementKey, Region } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, sectionTemplate, talentTemplate } from '../CharacterSheet'
import { customHealNode, dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const auto = normalSrc(data_gen.weaponTypeKey)

const key: CharacterKey = "Jean"
const elementKey: ElementKey = "anemo"
const regionKey: Region = "mondstadt"
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    stamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    enterExitDmg: skillParam_gen.burst[b++],
    burstActivationAtkModifier: skillParam_gen.burst[b++],
    burstActionFlatModifier: skillParam_gen.burst[b++],
    burstRegenAtkModifier: skillParam_gen.burst[b++],
    burstRegenFlatModifier: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chance: skillParam_gen.passive1[p1++][0],
    atkPercentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    increaseDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    moveSpd: skillParam_gen.constellation2[0],
    atkSpd: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemoRes: skillParam_gen.constellation4[0],
  },
  constellation6: {
    dmgReduction: skillParam_gen.constellation6[0],
  },
} as const

const regen = healNodeTalent("atk", datamine.burst.burstActivationAtkModifier, datamine.burst.burstActionFlatModifier, "burst")
const contRegen = healNodeTalent("atk", datamine.burst.burstRegenAtkModifier, datamine.burst.burstRegenFlatModifier, "burst")
const a1Regen = greaterEq(input.asc, 1, customHealNode(prod(percent(datamine.passive1.atkPercentage), input.total.atk)))

const skill_dmg_ = greaterEq(input.constellation, 1, percent(datamine.constellation1.increaseDmg))

const [condC2Path, condC2] = cond(key, "c2")
const atkSPD_ = equal(condC2, "on", greaterEq(input.constellation, 2, percent(datamine.constellation2.atkSpd)))
const moveSPD_ = equal(condC2, "on", greaterEq(input.constellation, 2, percent(datamine.constellation2.moveSpd)))

const [condC4Path, condC4] = cond(key, "c4")
const anemo_enemyRes_ = equal(condC4, "on", greaterEq(input.constellation, 4, percent(-Math.abs(datamine.constellation4.anemoRes))))

const [condC6Path, condC6] = cond(key, "c6")
const dmgRed_ = equal(condC6, "on", greaterEq(input.constellation, 6, percent(datamine.constellation6.dmgReduction)))

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
    c1Dmg: dmgNode("atk", datamine.skill.dmg, "skill", { premod: { skill_dmg_ } }),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
    enterExitDmg: dmgNode("atk", datamine.burst.enterExitDmg, "burst"),
    regen,
    contRegen
  },
  passive1: {
    a1Regen
  },
  constellation2: {
    atkSPD_,
    moveSPD_
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, elementKey, regionKey, data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      atkSPD_,
      moveSPD_,
      anemo_enemyRes_,
      dmgRed_
    }
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
      auto: talentTemplate("auto", tr, auto, undefined, undefined, [{
        ...sectionTemplate("auto", tr, auto,
          datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        ),
        text: tr("auto.fields.normal"),
      }, {
        ...sectionTemplate("auto", tr, auto, [{
          node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.5` }),
        }, {
          text: tr("auto.skillParams.6"),
          value: datamine.charged.stamina,
        }]),
        text: tr("auto.fields.charged"),
      }, {
        ...sectionTemplate("auto", tr, auto, [{
          node: infoMut(dmgFormulas.plunging.dmg, { key: "sheet_gen:plunging.dmg" }),
        }, {
          node: infoMut(dmgFormulas.plunging.low, { key: "sheet_gen:plunging.low" }),
        }, {
          node: infoMut(dmgFormulas.plunging.high, { key: "sheet_gen:plunging.high" }),
        }]),
        text: tr("auto.fields.plunging"),
      }]),
      skill: talentTemplate("skill", tr, burst, [{
        node: infoMut(dmgFormulas.skill.dmg, { key: `char_${key}_gen:skill.skillParams.0` }),
      }, {
        canShow: (data) => data.get(input.constellation).value >= 1,
        node: infoMut(dmgFormulas.skill.c1Dmg, { key: `char_${key}:c1CondName` }),
        textSuffix: "(C1)"
      }, {
        text: tr("skill.skillParams.1"),
        value: `${datamine.skill.stamina}`,
        unit: "/s"
      }, {
        text: tr("skill.skillParams.2"),
        value: `${datamine.skill.duration}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.3"),
        value: `${datamine.skill.cd}`,
        unit: "s"
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.enterExitDmg, { key: `char_${key}_gen:burst.skillParams.1` }),
      }, {
        node: infoMut(dmgFormulas.burst.regen, { key: `char_${key}_gen:burst.skillParams.2`, variant: "success" }),
      }, {
        node: infoMut(dmgFormulas.burst.contRegen, { key: `char_${key}_gen:burst.skillParams.3`, variant: "success" }),
      }, {
        text: sgt("duration"),
        value: 11,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: `${datamine.burst.cd}`,
        unit: "s"
      }, {
        text: tr("burst.skillParams.5"),
        value: `${datamine.burst.enerCost}`,
      }]),
      passive1: talentTemplate("passive1", tr, passive1, [{
        canShow: (data) => data.get(input.asc).value >= 1,
        node: infoMut(dmgFormulas.passive1.a1Regen, { key: `sheet_gen:healing`, variant: "success" }),
      }]),
      passive2: talentTemplate("passive2", tr, passive2, [{
        canShow: (data) => data.get(input.asc).value >= 4,
        text: st("energyRegen"),
        value: datamine.passive2.energyRegen
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        canShow: greaterEq(input.constellation, 2, 1),
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: trm("c2CondName"),
        states: {
          on: {
            fields: [{
              node: atkSPD_
            }, {
              node: moveSPD_
            }, {
              text: sgt("duration"),
              value: datamine.constellation2.duration,
              unit: "s"
            }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, undefined, {
        canShow: greaterEq(input.constellation, 4, 1),
        value: condC4,
        path: condC4Path,
        teamBuff: true,
        name: trm("c4CondName"),
        states: {
          on: {
            fields: [{
              node: anemo_enemyRes_
            }]
          }
        }
      }),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        canShow: greaterEq(input.constellation, 6, 1),
        value: condC6,
        path: condC6Path,
        teamBuff: true,
        name: trm("c6CondName"),
        states: {
          on: {
            fields: [{
              node: dmgRed_
            }]
          }
        }
      }),
    },
  },
}
export default new CharacterSheet(sheet, data)