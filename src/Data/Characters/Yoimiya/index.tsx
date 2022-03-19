import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, greaterEq, infoMut, lookup, matchFull, percent, prod, subscript, sum, unequal } from "../../../Formula/utils"
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { INodeFieldDisplay } from '../../../Types/IFieldDisplay'
import { range } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'


const characterKey: CharacterKey = "Yoimiya"
const elementKey: ElementKey = "pyro"
const data_gen = data_gen_src as CharacterData
const [tr, charTr] = trans("char", characterKey)

const datamine = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],//x2
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],//x2
      skillParam_gen.auto[4],
    ]
  },
  charged: {
    hit: skillParam_gen.auto[5],
    full: skillParam_gen.auto[6],
    kindling: skillParam_gen.auto[7],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg_: skillParam_gen.skill[3],
    duration: skillParam_gen.skill[2][0],
    cd: skillParam_gen.skill[1][0]
  },
  burst: {
    dmg: skillParam_gen.burst[0],
    exp: skillParam_gen.burst[1],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0]
  },
  passive1: {
    pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 10,
  },
  passive2: {
    fixed_atk_: skillParam_gen.passive2[0][0],
    var_atk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    burst_durationInc: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2]
  },
  constellation2: {
    pyro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation3: {},
  constellation4: {
    cdRed: skillParam_gen.constellation4[0]
  },
  constellation5: {},
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    dmg_: skillParam_gen.constellation6[1],
  },
}

const [condSkillPath, condSkill] = cond(characterKey, "skill")
const [condA1Path, condA1] = cond(characterKey, "a1")
const [condC1Path, condC1] = cond(characterKey, "c1")
const [condC2Path, condC2] = cond(characterKey, "c2")
const const3TalentInc = greaterEq(input.constellation, 3, 3)
const const5TalentInc = greaterEq(input.constellation, 5, 3)
const normal_dmgMult = matchFull(condSkill, "skill", subscript(input.total.skillIndex, datamine.skill.dmg_), 1)
const a1Stacks = lookup(condA1, Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i => [i, constant(i)])), 0)
const pyro_dmg_ = infoMut(prod(percent(datamine.passive1.pyro_dmg_), a1Stacks), { key: 'pyro_dmg_', variant: elementKey })
const atk_ = unequal(input.activeCharKey, characterKey, sum(percent(datamine.passive2.fixed_atk_), prod(percent(datamine.passive2.var_atk_), a1Stacks)))
const c1atk_ = equal(condC1, 'c1', percent(datamine.constellation1.atk_))
const c2pyro_dmg_ = equal(condC2, 'c2', percent(datamine.constellation2.pyro_dmg_), { key: 'pyro_dmg_', variant: elementKey })

const canShowC6 = uiData => uiData.get(input.constellation).value >= 6 && uiData.get(condSkill).value === 'skill'
const canShowA4 = uiData => uiData.get(input.asc).value >= 4

const normalEntries = datamine.normal.hitArr.map((arr, i) =>
  [i, prod(normal_dmgMult, dmgNode("atk", arr, "normal", { hit: { ele: matchFull(condSkill, "skill", constant(elementKey), constant("physical")) } }))])
const kindlingEntries = normalEntries.map(([_, node], i) => [i, greaterEq(input.constellation, 6, prod(percent(datamine.constellation6.dmg_), node))])


export const dmgFormulas = {
  normal: Object.fromEntries(normalEntries),
  charged: {
    hit: dmgNode("atk", datamine.charged.hit, "charged"),
    full: dmgNode("atk", datamine.charged.full, "charged", { hit: { ele: constant(elementKey) } }),
    kindling: unequal(condSkill, "skill", dmgNode("atk", datamine.charged.kindling, "charged", { hit: { ele: constant(elementKey) } }))
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {},
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
    exp: dmgNode("atk", datamine.burst.exp, "burst", { hit: { ele: constant(elementKey) } }),
  },
  constellation6: Object.fromEntries(kindlingEntries)
}

export const dataObj = dataObjForCharacterSheet(characterKey, elementKey, "inazuma", data_gen, dmgFormulas, {
  bonus: {
    skill: const3TalentInc,
    burst: const5TalentInc,
  },
  teamBuff: {
    premod: {
      atk_,
    }
  },
  premod: {
    atk_: c1atk_,
    pyro_dmg_: sum(pyro_dmg_, c2pyro_dmg_),
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
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: datamine.normal.hitArr.map((_, i) => ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
              textSuffix: ([0, 3].includes(i)) ? st("brHits", { count: 2 }) : ""
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              node: infoMut(dmgFormulas.charged.hit, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
            }, {
              node: infoMut(dmgFormulas.charged.full, { key: `char_${characterKey}_gen:auto.skillParams.6` }),
            }, {
              node: infoMut(dmgFormulas.charged.kindling, { key: `char_${characterKey}_gen:auto.skillParams.7` }),
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
          },
        ],
      },
      skill: talentTemplate("skill", tr, skill, [{
        text: tr("skill.skillParams.2"),
        value: datamine.skill.cd,
        unit: 's'
      }], {
        name: charTr("skillState"),
        path: condSkillPath,
        value: condSkill,
        states: {
          skill: {
            fields: [{
              text: charTr("normMult"),
              value: data => data.get(normal_dmgMult).value * 100,
              fixed: 1,
              unit: "%",
            }, {
              text: charTr("normPyroInfus"),
            }, {
              text: tr("skill.skillParams.1"),
              value: datamine.skill.duration,
              unit: 's'
            }]
          }
        }
      }),
      burst: talentTemplate("burst", tr, burst, [{
        node: infoMut(dmgFormulas.burst.dmg, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
      }, {
        node: infoMut(dmgFormulas.burst.exp, { key: `char_${characterKey}_gen:burst.skillParams.1` }),
      }, {
        text: tr("burst.skillParams.2"),
        value: uiData => datamine.burst.duration + (uiData.get(input.constellation).value >= 1 ? datamine.constellation1.burst_durationInc : 0),
        unit: "s"
      }, {
        text: tr("burst.skillParams.3"),
        value: datamine.burst.cd,
        unit: "s"
      }, {
        text: tr("burst.skillParams.4"),
        value: 60,
      }]),
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
          canShow: greaterEq(input.asc, 1, 1),
          value: condA1,
          path: condA1Path,
          name: tr("passive1.name"),
          states: Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i =>
            [i, {
              name: `${i} stack`,
              fields: [
                {
                  node: pyro_dmg_
                },
                {
                  text: sgt("duration"),
                  value: datamine.passive1.duration,
                  unit: "s"
                }
              ]

            }]))
        }
      ),
      passive2: talentTemplate("passive2", tr, passive2, [{
        canShow: canShowA4,
        node: infoMut(atk_, { key: `char_${characterKey}_gen:passive2.name` })
      }, {
        canShow: canShowA4,
        text: sgt("duration"),
        value: datamine.passive2.duration,
        unit: "s"
      }]),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1, [], {
        canShow: greaterEq(input.constellation, 1, 1),
        name: charTr("c1"),
        value: condC1,
        path: condC1Path,
        states: {
          c1: {
            fields: [{
              node: constant(datamine.constellation1.atk_, { key: "atk_" })
            }, {
              text: sgt("duration"),
              value: datamine.constellation1.duration,
              unit: 's'
            }]
          }
        }
      }),
      constellation2: talentTemplate("constellation2", tr, c2, undefined, {
        canShow: greaterEq(input.constellation, 2, 1),
        name: charTr("c2"),
        value: condC2,
        path: condC2Path,
        states: {
          c2: {
            fields: [
              {
                node: c2pyro_dmg_
              }, {
                text: sgt("duration"),
                value: datamine.constellation2.duration,
                unit: "s"
              }]
          }
        }
      }),
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: const3TalentInc }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: const5TalentInc }]),
      constellation6: talentTemplate("constellation6", tr, c6,
        datamine.normal.hitArr.map((_, i): INodeFieldDisplay => ({
          canShow: canShowC6,
          node: infoMut(dmgFormulas.constellation6[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
          textSuffix: ([0, 3].includes(i)) ? st("brHits", { count: 2 }) : ""
        }))
      )
    },
  },
};

export default new CharacterSheet(sheet, dataObj);
