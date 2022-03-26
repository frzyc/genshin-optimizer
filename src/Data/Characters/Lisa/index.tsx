import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { equal, greaterEq, infoMut, prod, min, constant } from '../../../Formula/utils'
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap, range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Lisa"
const elementKey: ElementKey = "electro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)

let a = 0, s = 0, b = 0, p2 = 0, c1i = 0, c6i = 0
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    stack0: skillParam_gen.skill[s++],
    stack1: skillParam_gen.skill[s++],
    stack2: skillParam_gen.skill[s++],
    stack3: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
    press: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    tick: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0]
  },
  passive1: {
    unknown: skillParam_gen.passive1[0][0] // I have no idea what this is
  },
  passive2: {
    defShred: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0]
  }
} as const

const [condA4Path, condA4] = cond(key, "LisaA4")
const [condC2Path, condC2] = cond(key, "LisaC2")

const nodeA4DefShred = equal(condA4, "on", greaterEq(input.asc, 1, datamine.passive2.defShred))
const nodeC2DefIncrease = equal(condC2, "on", greaterEq(input.constellation, 2, constant(0.25))) // Doesn't exist in skillParam_gen

const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([name, arr]) =>
    [name, dmgNode("atk", arr, "plunging")])),
  skill: {
    stack0: dmgNode("atk", datamine.skill.stack0, "skill"),
    stack1: dmgNode("atk", datamine.skill.stack1, "skill"),
    stack2: dmgNode("atk", datamine.skill.stack2, "skill"),
    stack3: dmgNode("atk", datamine.skill.stack3, "skill"),
    press: dmgNode("atk", datamine.skill.press, "skill")
  },
  burst: {
    tick: dmgNode("atk", datamine.burst.tick, "burst")
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    burst: nodeC3,
    skill: nodeC5,
  },
  premod: {
    def_: nodeC2DefIncrease,
  },
  teamBuff: {
    premod: {
      enemyDefRed_: nodeA4DefShred
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
  elementKey: elementKey,
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
              node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` })
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg, { key: `char_${key}_gen:auto.skillParams.4` }),
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
          }
        ],
      },
      skill: talentTemplate("skill", tr, skill, [
        {
          node: infoMut(dmgFormulas.skill.press, { key: `char_${key}_gen:skill.skillParams.0` }),
        },
        ...range(0, 3).map(i => ({
          node: infoMut(dmgFormulas.skill[`stack${i}`], { key: `char_${key}_gen:skill.skillParams.${2+i}`})
        })), {
          text: sgt("press.cd"),
          value: datamine.skill.pressCD,
          unit: 's'
        }, {
          text: sgt("hold.cd"),
          value: datamine.skill.holdCD,
          unit: 's'
        }
      ]),
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.tick, { key: `char_${key}_gen:burst.skillParams.0` }),
          }, {
            text: tr("burst.skillParams.1"),
            value: datamine.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.2"),
            value: datamine.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: datamine.burst.cost,
          }]
        }]
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2, undefined, {
        name: trm("a4C"),
        value: condA4,
        path: condA4Path,
        teamBuff: true,
        header: conditionalHeader("passive2", tr, passive2),
        canShow: greaterEq(input.asc, 4, 1),
        states: {
          on: {
            fields: [{
              node: nodeA4DefShred
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: 's'
            }]
          }
        }
      }),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        value: condC2,
        path: condC2Path,
        name: trm("c2C"),
        header: conditionalHeader("constellation2", tr, c2),
        canShow: greaterEq(input.constellation, 2, 1),
        states: {
          on: {
            fields: [{
              node: nodeC2DefIncrease
            }, {
              text: st("incInterRes")
            }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: nodeC3 }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: nodeC5 }]),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
