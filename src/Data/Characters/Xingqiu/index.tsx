import { CharacterData } from 'pipeline'
import { input } from "../../../Formula/index"
import { constant, equal, greaterEq, infoMut, min, percent, prod, subscript, sum } from "../../../Formula/utils"
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { cond, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterKey = "Xingqiu"
const elementKey: ElementKey = "hydro"
const data_gen = data_gen_src as CharacterData
const [tr, trm] = trans("char", key)

let s = 0, b = 0
export const datamine = {
  normal: {
    hitArr: [
      (skillParam_gen.auto[0]),//1
      (skillParam_gen.auto[1]),//2
      (skillParam_gen.auto[2]),//3
      // (skillParam_gen.auto[3]),
      (skillParam_gen.auto[4]),//4
      (skillParam_gen.auto[5]),//5
      // (skillParam_gen.auto[6]),
    ]
  },
  charged: {
    hit1: (skillParam_gen.auto[7]),
    hit2: (skillParam_gen.auto[8]),
    stamina: skillParam_gen.auto[9][0]
  },
  plunging: {
    dmg: (skillParam_gen.auto[10]),
    low: (skillParam_gen.auto[11]),
    high: (skillParam_gen.auto[12]),
  },
  skill: {
    hit1: (skillParam_gen.skill[s++]),
    hit2: (skillParam_gen.skill[s++]),
    dmgRed_: (skillParam_gen.skill[s++]),
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: (skillParam_gen.burst[b++]),
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    hydro_dmg_: 0.20
  },
  constellation2: {
    hydro_enemyRes_: -0.15,
    skill_duration: 3
  },
  constellation4: {
    dmg_: 0.50
  },
} as const

const nodeA4 = greaterEq(input.asc, 4, datamine.passive2.hydro_dmg_)

const [condC2Path, condC2] = cond(key, "c2")
const nodeC2 = greaterEq(input.constellation, 2,
  equal(condC2, "on", datamine.constellation2.hydro_enemyRes_))

const [condSkillPath, condSkill] = cond(key, "skill")

const [condBurstPath, condBurst] = cond(key, "burst")
const nodeC4 = greaterEq(input.constellation, 4,
  equal(condBurst, "on", datamine.constellation4.dmg_), { key: `char_${key}:c4dmg_` })

const nodeSkillDmgRed_ = equal(condSkill, "on",
  sum(subscript(input.total.skillIndex, datamine.skill.dmgRed_, { key: "_" }), min(percent(0.24), prod(percent(0.2), input.total.hydro_dmg_))))

const nodeA4Heal = greaterEq(input.asc, 1, prod(input.total.hp, percent(0.06)))

export const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press1: prod(sum(percent(1), nodeC4), dmgNode("atk", datamine.skill.hit1, "skill")),
    press2: prod(sum(percent(1), nodeC4), dmgNode("atk", datamine.skill.hit2, "skill")),
    dmgRed_: nodeSkillDmgRed_,
  },
  passive1: {
    healing: nodeA4Heal
  },
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
  }
}
const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(key, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC5,
    burst: nodeC3,
  },
  teamBuff: {
    premod: {
      hydro_enemyRes_: nodeC2,
      dmgRed_: infoMut(nodeSkillDmgRed_, { key: "dmgRed_" }),
    }
  },
  premod: {
    hydro_dmg_: nodeA4,
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
          fields: datamine.normal.hitArr.map((_, i) => ({
            node: infoMut(dmgFormulas.normal[i], { key: `char_${key}_gen:auto.skillParams.${i}` }),
            textSuffix: (i === 2 || i === 4) ? st("brHits", { count: 2 }) : ""
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${key}_gen:auto.skillParams.5` }),
            textSuffix: "(1)"
          }, {
            node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${key}_gen:auto.skillParams.5` }),
            textSuffix: "(2)"
          }, {
            text: tr("auto.skillParams.6"),
            value: datamine.charged.stamina,
          }]
        }, {
          text: tr(`auto.fields.plunging`),
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
        node: infoMut(dmgFormulas.skill.press1, { key: `char_${key}_gen:skill.skillParams.0` }),
        textSuffix: "(1)"
      }, {
        node: infoMut(dmgFormulas.skill.press2, { key: `char_${key}_gen:skill.skillParams.0` }),
        textSuffix: "(2)"
      }, {
        text: tr("skill.skillParams.2"),
        value: data => data.get(input.constellation).value >= 2
          ? `${datamine.skill.duration}s + ${datamine.constellation2.skill_duration}`
          : `${datamine.skill.duration}`,
        unit: "s"
      }, {
        text: tr("skill.skillParams.3"),
        value: datamine.skill.cd,
        unit: "s"
      }], {
        teamBuff: true,
        value: condSkill,
        path: condSkillPath,
        name: trm("skillCond"),
        states: {
          on: {
            fields: [{
              node: dmgFormulas.skill.dmgRed_,
            }]
          }
        }
      }),
      burst: talentTemplate("burst", tr, burst, [{
        text: tr("burst.skillParams.2"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cost,
      }], {
        value: condBurst,
        path: condBurstPath,
        name: trm("burstCond"),
        states: {
          on: {
            fields: [{
              node: infoMut(dmgFormulas.burst.dmg, { key: `char_${key}_gen:burst.skillParams.0` }),
            }, {
              text: tr("burst.skillParams.1"),
              value: datamine.burst.duration,
              unit: "s"
            }, {
              node: nodeC4
            }]
          }
        }
      }),
      passive1: talentTemplate("passive1", tr, passive1, [{
        node: infoMut(dmgFormulas.passive1.healing, { key: `sheet_gen:healing`, variant: "success" }),
      },]),
      passive2: talentTemplate("passive2", tr, passive2, [{
        node: nodeA4
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        canShow: greaterEq(input.constellation, 2, 1),
        value: condC2,
        path: condC2Path,
        teamBuff: true,
        name: trm("c2Cond"),
        states: {
          on: {
            fields: [{
              node: nodeC2
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
