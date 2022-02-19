import { CharacterData } from 'pipeline'
import { input } from '../../../Formula'
import { constant, equal, equalStr, greaterEq, infoMut, lookup, matchFull, percent, prod, subscript, sum, unequal } from "../../../Formula/utils"
import { CharacterKey, ElementKey } from '../../../Types/consts'
import { IFieldDisplay } from '../../../Types/IFieldDisplay_WR'
import { cond, sgt, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, damageTemplate, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import banner from './Banner.png'
import burst from './burst.png'
import card from './Character_Yoimiya_Card.png'
import c1 from './constellation1.png'
import c2 from './constellation2.png'
import c3 from './constellation3.png'
import c4 from './constellation4.png'
import c5 from './constellation5.png'
import c6 from './constellation6.png'
import { data as datamine } from './data'
import data_gen_src from './data_gen.json'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import skill from './skill.png'
import { range } from '../../../Util/Util'


const characterKey: CharacterKey = "Yoimiya"
const elementKey: ElementKey = "pyro"
const data_gen = data_gen_src as CharacterData
const char_Yoimiya_gen = `char_${characterKey}_gen`
const char_Yoimiya = `char_${characterKey}`
const sheet_gen = "sheet_gen"
const [tr, charTr] = trans("char", characterKey)

const [condSkillPath, condSkill] = cond(characterKey, "skill")
const [condA1Path, condA1] = cond(characterKey, "a1")
const [condA4Path, condA4] = cond(characterKey, "a4")
const [condC1Path, condC1] = cond(characterKey, "c1")
const [condC2Path, condC2] = cond(characterKey, "c2")
const const3TalentInc = greaterEq(input.constellation, 3, 3)
const const5TalentInc = greaterEq(input.constellation, 5, 3)
const normal_dmgMult = matchFull(condSkill, "skill", subscript(input.total.skillIndex, datamine.skill.dmg_), 1, { key: 'normal_dmg_' })
const a1Stacks = lookup(condA1, Object.fromEntries(range(1, datamine.passive1.maxStacks).map(i => [i, constant(i)])), 0)
const pyro_dmg_ = infoMut(prod(percent(datamine.passive1.pyro_dmg_), a1Stacks), { key: 'pyro_dmg_' })
const atk_ = unequal(input.activeCharKey, characterKey, sum(percent(datamine.passive2.fixed_atk_), prod(percent(datamine.passive2.var_atk_), a1Stacks)))
const c1atk_ = equal(condC1, 'c1', percent(datamine.constellation1.atk_))
const c2pyro_dmg_ = equal(condC2, 'c2', percent(datamine.constellation2.pyro_dmg_), { key: 'pyro_dmg_' })

const normalEntries = datamine.normal.hitArr.map((arr, i) =>
[i, prod(normal_dmgMult, dmgNode("atk", arr, "normal", { hit: { ele: matchFull(condSkill, "skill", constant(elementKey), constant("physical")) } }))])

const kindlingEntries = normalEntries.map(([_, node], i, arr) => [i + arr.length, (prod(prod(percent(datamine.constellation6.dmg_), percent(datamine.constellation6.chance)), node))])


export const dmgFormulas = {
  // TODO: Provide premod multiplicative damage bonuses e.g. normal_dmgMult
  normal: Object.fromEntries([...normalEntries, ...kindlingEntries]),
  charged: {
    hit: dmgNode("atk", datamine.charged.hit, "charged"),
    full: dmgNode("atk", datamine.charged.full, "charged", { hit: { ele: constant(elementKey) } }),
    kindling: dmgNode("atk", datamine.charged.kindling, "charged", { hit: { ele: constant(elementKey) } })
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {},
  burst: {
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
    exp: dmgNode("atk", datamine.burst.exp, "burst", { hit: { ele: constant(elementKey) } }),
  }
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
            fields: [
              damageTemplate(dmgFormulas.normal[0], char_Yoimiya_gen, "auto.skillParams.0", { comboMultiplier: 2 }),
              damageTemplate(dmgFormulas.normal[1], char_Yoimiya_gen, "auto.skillParams.1"),
              damageTemplate(dmgFormulas.normal[2], char_Yoimiya_gen, "auto.skillParams.2"),
              damageTemplate(dmgFormulas.normal[3], char_Yoimiya_gen, "auto.skillParams.3", { comboMultiplier: 2 }),
              damageTemplate(dmgFormulas.normal[4], char_Yoimiya_gen, "auto.skillParams.4"),
            ]
          }, {
            text: tr("auto.fields.charged"),
            fields: [
              damageTemplate(dmgFormulas.charged.hit, char_Yoimiya_gen, "auto.skillParams.5"),
              damageTemplate(dmgFormulas.charged.full, char_Yoimiya_gen, "auto.skillParams.6"),
              damageTemplate(dmgFormulas.charged.kindling, char_Yoimiya_gen, "auto.skillParams.7"),
            ]
          },
          {
            text: tr("auto.fields.plunging"),
            fields: [
              damageTemplate(dmgFormulas.plunging.dmg, sheet_gen, "plunging.dmg"),
              damageTemplate(dmgFormulas.plunging.low, sheet_gen, "plunging.low"),
              damageTemplate(dmgFormulas.plunging.high, sheet_gen, "plunging.high"),
            ]
          },
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            {
              text: tr("skill.skillParams.1"),
              value: datamine.skill.duration,
              unit: 's'
            }, {
              text: tr("skill.skillParams.2"),
              value: datamine.skill.cd,
              unit: 's'
            }],
          conditional: {
            name: tr("skill.name"),
            path: condSkillPath,
            value: condSkill,
            states: {
              skill: {}
            }
          }
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [
            damageTemplate(dmgFormulas.burst.dmg, char_Yoimiya_gen, "burst.skillParams.0"),
            damageTemplate(dmgFormulas.burst.exp, char_Yoimiya_gen, "burst.skillParams.1"),
            {
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
            }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1, [],
        {
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
        canShow: uiData => uiData.get(input.asc).value >= 4,
        node: infoMut(atk_, { key: `${char_Yoimiya_gen}:passive2.name` })
      }, {
        canShow: uiData => uiData.get(input.asc).value >= 4,
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
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: {
            canShow: greaterEq(input.constellation, 2, 1),
            name: charTr("c2"),
            value: condC2,
            path: condC2Path,
            states: {
              c2: {
                fields: [
                  {
                    node: c2pyro_dmg_
                    // node: constant(datamine.constellation2.pyro_dmg_, { key: 'pyro_dmg_' }),
                  }, {
                    text: sgt("duration"),
                    value: datamine.constellation2.duration,
                    unit: "s"
                  }]
              }
            }
          }
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, [{ node: const3TalentInc }]),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, [{ node: const5TalentInc }]),
      constellation6: talentTemplate("constellation6", tr, c6, [
        damageTemplate(dmgFormulas.normal[5], char_Yoimiya_gen, "auto.skillParams.0", { comboMultiplier: 2 }),
        damageTemplate(dmgFormulas.normal[6], char_Yoimiya_gen, "auto.skillParams.1"),
        damageTemplate(dmgFormulas.normal[7], char_Yoimiya_gen, "auto.skillParams.2"),
        damageTemplate(dmgFormulas.normal[8], char_Yoimiya_gen, "auto.skillParams.3", { comboMultiplier: 2 }),
        damageTemplate(dmgFormulas.normal[9], char_Yoimiya_gen, "auto.skillParams.4"),
      ])
    },
  },
};

export default new CharacterSheet(sheet, dataObj);
