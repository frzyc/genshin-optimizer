import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, percent, prod, subscript, sum, unequal } from '../../../Formula/utils'
import { CharacterKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { customDmgNode, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData

const key: CharacterKey = "Eula"
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p2 = 0
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
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    icewhirl: skillParam_gen.skill[s++],
    physResDec: skillParam_gen.skill[s++],
    cryoResDec: skillParam_gen.skill[s++],
    resDecDuration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
    defBonus: skillParam_gen.skill[s++][0],
    unknown: skillParam_gen.skill[s++][0], // combined cooldown?
    physResDecNegative: skillParam_gen.skill[s++],
    cryoResDecNegative: skillParam_gen.skill[s++],
    grimheartDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lightfallDmg: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    maxStack: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[p2++][0],
  },
  constellation1: {
    physInc: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    maxDuration: skillParam_gen.constellation1[2],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    initialStack: skillParam_gen.constellation6[0],
    additionalStackChance: skillParam_gen.constellation6[1],
  },
} as const

const [condGrimheartPath, condGrimheart] = cond(key, "Grimheart")

const def_ = equal("stacks", condGrimheart, percent(datamine.skill.defBonus))
const cryo_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.cryoResDecNegative))
const physical_enemyRes_ = equal("consumed", condGrimheart, subscript(input.total.skillIndex, datamine.skill.physResDecNegative))

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    spinningDmg: dmgNode("atk", datamine.charged.spinningDmg, "charged"),
    finalDmg: dmgNode("atk", datamine.charged.finalDmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill"),
    hold: dmgNode("atk", datamine.skill.hold, "skill"),
    icewhirl: dmgNode("atk", datamine.skill.icewhirl, "skill"),
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst"),
  },
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)

export const data = dataObjForCharacterSheet(key, "cryo", "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  premod: {
    def_,
    cryo_enemyRes_,
    physical_enemyRes_
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey),
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) =>
            ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
              textSuffix: i === 2 ? "(2 Hits)" : i === 4 ? "(2 Hits)" : ""
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.spinningDmg, { key: `char_${key}_gen:auto.skillParams.5` }),
            }, {
              node: infoMut(dmgFormulas.charged.finalDmg, { key: `char_${key}_gen:auto.skillParams.6` }),
            }, {
              text: tr("auto.skillParams.7"),
              value: datamine.charged.stamina,
              unit: '/s'
            }, {
              text: tr("auto.skillParams.8"),
              value: datamine.charged.duration,
              unit: 's'
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
          }
        ],
      },
      skill: { // Cannot use talentTemplate because this has multiple sections.
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.8"),
            value: `${datamine.skill.pressCd}`,
            unit: 's'
          }, {
            node: infoMut(dmgFormulas.skill.hold, { key: `char_${key}_gen:skill.skillParams.1` }),
          }, {
            text: tr("skill.skillParams.9"),
            value: `${datamine.skill.holdCd}`,
            unit: 's'
          }],
          conditional: { // Grimheart
            value: condGrimheart,
            path: condGrimheartPath,
            name: trm("skillC.name"),
            header: conditionalHeader("skill", tr, skill),
            states: {
              "stacks": {
                name: "Stacks",
                fields: [{
                  node: def_,
                }, {
                  text: trm("skillC.grimheart.int")
                }, {
                  text: tr("skill.skillParams.4"),
                  value: `${datamine.skill.grimheartDuration}`,
                  unit: 's'
                }, {
                  text: tr("burst.skillParams.3"),
                  value: 2,
                },]
              },
              "consumed": {
                name: "Consumed",
                fields: [{
                  node: cryo_enemyRes_,
                }, {
                  node: physical_enemyRes_,
                }, {
                  text: sgt('duration'),
                  value: 7,
                  unit: 's'
                }]
              }
            }
          },
        }, {
          fields: [{
            node: infoMut(dmgFormulas.skill.icewhirl, { key: `char_${key}_gen:skill.skillParams.2` }),
          }]
        }]
      },
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
      }, {
        text: tr("burst.skillParams.4"),
        value: `${datamine.burst.cd}`,
        unit: 's'
      }, {
        text: tr("burst.skillParams.5"),
        value: `${datamine.burst.enerCost}`,
      }, {
        text: sgt("duration"),
        value: 7,
        unit: 's'
      },]),
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
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
