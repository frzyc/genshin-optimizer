import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, greaterEqStr, infoMut, lookup, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode, healNodeTalent } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import { UIData } from '../../../Formula/uiData'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Bennett"
const elementKey: ElementKey = "pyro"
const [tr, trm] = trans("char", key)

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
    cd_red: 20, // Not in the datamine for some reason
  },
  passive2: {
    cd_red: 50, // Not in the datamine for some reason
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

const c1Atk = greaterEq(input.constellation, 1, datamine.constellation1.atk_inc)

const atkIncRatio = sum(subscript(input.total.burstIndex, datamine.burst.atkBonus), c1Atk)
const [condInAreaPath, condInArea] = cond(key, "inArea")
const inArea = equal("inArea", condInArea, 1)
const inAreaAtk = equal(inArea, 1,
  prod(atkIncRatio, input.base.atk))

const inAreaA4 = greaterEq(input.asc, 4,
  equal(inArea, 1, datamine.passive2.cd_red))

const c6AndCorrectWep = greaterEq(input.constellation, 6,
  lookup(target.weaponType,
    { "sword": constant(1), "claymore": constant(1), "polearm": constant(1) }, constant(0)))
const inAreaC6PyroDmg = equal(inArea, 1,
  equal(c6AndCorrectWep, 1, datamine.constellation6.pyro_dmg))
const inAreaC6Infusion = equalStr(inArea, 1,
  equalStr(c6AndCorrectWep, 1, elementKey))

const [condUnderHPPath, condUnderHP] = cond(key, "underHP")
const underHP = greaterEq(input.constellation, 2,
  equal("underHP", condUnderHP, datamine.constellation2.er_inc))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.dmg1, "charged"),
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
    atkInc: inAreaAtk,
  },
  constellation1: {
    addlATK: prod(c1Atk, input.base.atk)
  },
  constellation4: {
    dmg: prod(dmgNode("atk", datamine.skill.hold1_2, "skill"), datamine.constellation4.dmg)
  }
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      pyro_dmg_: inAreaC6PyroDmg,
      atk: inAreaAtk,
    },
    team: {
      infusion: inAreaC6Infusion,
    },
  },
  premod: {
    enerRech_: underHP,

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
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: datamine.normal.hitArr.map((percentArr, i) =>
          ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
          }, {
            text: tr("auto.skillParams.6"),
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
      }]),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` })
      }, {
        node: infoMut(dmgFormulas.burst.regen, { key: `char_${key}_gen:burst.skillParams.1`, variant: "success" })
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
      }], {
        value: condInArea,
        path: condInAreaPath,
        name: trm("withinArea"),
        teamBuff: true,
        states: {
          inArea: {
            fields: [{
              text: tr("burst.skillParams.2"),
              value: data => data.get(atkIncRatio).value * 100,
              unit: "%"
            }, {
              node: infoMut(inAreaAtk, { key: `sheet:increase.atk` })
            }]
          }
        }
      }),
      passive1: talentTemplate("passive1", tr, passive1, [{
        text: st("skillCDRed"),
        value: datamine.passive1.cd_red,
        unit: "%"
      }]),
      passive2: talentTemplate("passive2", tr, passive2, undefined, {
        canShow: greaterEq(input.asc, 4, 1),
        value: condInArea,
        path: condInAreaPath,
        name: trm("withinArea"),
        states: {
          inArea: {
            fields: [{ // Node will not show CD reduction, have to use value instead
              text: st("skillCDRed"),
              value: datamine.passive2.cd_red,
              unit: "%",
            }]
          }
        }
      }),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, [{
        canShow: data => data.get(input.constellation).value >= 1,
        text: trm("additionalATKRatio"),
        value: datamine.constellation1.atk_inc * 100,
        unit: "%"
      }, {
        canShow: data => data.get(input.constellation).value >= 1,
        node: infoMut(dmgFormulas.constellation1.addlATK, { key: `char_${key}:additionalATK` })
      }]),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        canShow: greaterEq(input.constellation, 2, 1),
        value: condUnderHP,
        path: condUnderHPPath,
        name: trm("belowHP"),
        states: {
          underHP: {
            fields: [{
              node: underHP
            }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4, [{
        canShow: data => data.get(input.constellation).value >= 4,
        node: infoMut(dmgFormulas.constellation4.dmg, { key: `char_${key}:c4DMG` })
      }]),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6, undefined, {
        canShow: c6AndCorrectWep,
        value: condInArea,
        path: condInAreaPath,
        name: trm("withinArea"),
        teamBuff: true,
        states: {
          inArea: {
            fields: [{
              node: inAreaC6PyroDmg
            }, {
              text: <ColorText color={elementKey}>{st("infusion.pyro")}</ColorText>
            }]
          }
        }
      }),
    }
  }
};
export default new CharacterSheet(sheet, data);

function calculateSkillCD(data: UIData, skillCD: number): string {
  let cdFactor: number = 1.00;
  let result: string = skillCD + "s"
  if (data.get(input.asc).value >= 1) {
    cdFactor = 0.80;
  }
  cdFactor *= (1 - data.get(inAreaA4).value / 100);
  if (cdFactor !== 1.00) {
    result += " - " + (100 - cdFactor * 100) + "% = " + skillCD * cdFactor;
  }
  return result;
}
