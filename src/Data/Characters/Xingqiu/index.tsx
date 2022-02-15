import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from "../../../Formula/index"
import { constant, infoMut, match, percent, prod, sum, threshold_add, unmatch } from "../../../Formula/utils"
import { CharacterKey, ElementKey, Rarity, WeaponTypeKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { ICharacterSheet } from '../CharacterSheet'
import { absorbableEle, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { conditionalHeader, normalSrc, talentTemplate } from '../CharacterSheet'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'
import { mapNormals } from '../utils'
import {data as datamine} from './data'

const data_gen = data_gen_src as CharacterData
const characterKey: CharacterKey = "Xingqiu"
const elementKey: ElementKey = "hydro"
const [tr, trm] = trans("char", characterKey)
const { formula: normalDmg, section: normalSection } = mapNormals(datamine.normal.hitArr, [[2, 3], [5, 6]], characterKey)
// Conditional Input
// const [condSkillHitOpponentPath, condSkillHitOpponent] = cond(characterKey, "skillHit")
// const [condNormalHitOpponentPath, condNormalHitOpponent] = cond(characterKey, "normalHit")

// Conditional Output
// const asc1 = threshold_add(input.asc, 1,
//   unmatch(target.charKey, characterKey,
//     match(target.charEle, condSwirlReaction, datamine.passive1.eleMas)), { key: "eleMas" })

export const dmgFormulas = {
  normal: normalDmg,
  charged: {
    dmg1: dmgNode("atk", datamine.charged.hit1, "charged"),
    dmg2: dmgNode("atk", datamine.charged.hit2, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press1: dmgNode("atk", datamine.skill.hit1, "skill", { hit: { ele: constant(elementKey) } }),
    press2: dmgNode("atk", datamine.skill.hit2, "skill", { hit: { ele: constant(elementKey) } })
    dmgRed: data(, { key: "dmgRed_", pivot })
  },
  burst: {
    // TODO: burst dmg based on normal attacks?
    dmg: dmgNode("atk", datamine.burst.dmg, "burst", { hit: { ele: constant(elementKey) } }),
  }
}

export const data = dataObjForCharacterSheet(characterKey, elementKey, "liyue", data_gen, dmgFormulas, {
  bonus: {
    skill: threshold_add(input.constellation, 3, 3),
    burst: threshold_add(input.constellation, 5, 3),
  },
  teamBuff: {
    // 
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star as Rarity,
  elementKey,
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [
          normalSection,
          {
            text: tr(`auto.fields.charged`),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg1, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
              textSuffix: "(1)"
            }, {
              node: infoMut(dmgFormulas.charged.dmg2, { key: `char_${characterKey}_gen:auto.skillParams.5` }),
              textSuffix: "(2)"
            }, {
              text: tr("auto.skillParams.6"),
              value: datamine.charged.stam,
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
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press1, { key: `char_${characterKey}_gen:skill.skillParams.0` }),
          }, {
            node: infoMut(dmgFormulas.skill.press2, { key: `char_${characterKey}_gen:skill.skillParams.0` }),
          },{
            node: infoMut(dmgFormulas.skill.dmgRed, { key: `char_${characterKey}_gen:skill.skillParams.1` }),
          }, {
            text: tr("skill.skillParams.3"),
            value: datamine.skill.cd,
            unit: "s"
          }, {
            text: tr("skill.skillParams.2"),
            value: datamine.skill.duration,
            unit: "s"
          }]
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dmg, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
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
          }],
        }]
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: { // Swirl Element
            value: condSwirlReaction,
            path: condSwirlReactionPath,
            header: conditionalHeader("passive1", tr, passive1),
            description: tr("passive1.description"),
            name: st("eleSwirled"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: asc1,
              }, {
                text: sgt("duration"),
                value: datamine.passive1.duration,
                unit: "s"
              }],
            }]))
          },
        }]
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: { // Swirl Element
            value: condSkillHitOpponent,
            path: condSkillHitOpponentPath,
            header: conditionalHeader("passive1", tr, passive1),
            description: tr("passive1.description"),
            name: trm("asc4"),
            states: {
              hit: {
                fields: [{
                  node: asc4,
                }, {
                  text: sgt("duration"),
                  value: datamine.passive2.duration,
                  unit: "s"
                }],
              }
            }
          },
        }]
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default new CharacterSheet(sheet, data);
