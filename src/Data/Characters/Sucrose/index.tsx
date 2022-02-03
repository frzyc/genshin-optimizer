import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { Translate } from '../../../Components/Translate'
import { input, target } from "../../../Formula/index"
import { constant, customStringRead, infoMut, match, percent, prod, sum, threshold_add, unmatch } from "../../../Formula/utils"
import { CharacterKey, Rarity, WeaponTypeKey } from '../../../Types/consts'
import { objectFromKeyMap } from '../../../Util/Util'
import CharacterSheet, { ICharacterSheet } from '../CharacterSheet'
import { absorbableEle, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { conditionalHeader, normalSrc, sgt, st, talentTemplate } from '../SheetUtil_WR'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const characterKey: CharacterKey = "Sucrose"
const tr = (strKey: string) => <Translate ns={`char_${characterKey}_gen`} key18={strKey} />

let a = 0, s = 0, b = 0, p1 = 0, p2 = 0
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
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dot: skillParam_gen.burst[b++],
    dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    eleMas_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    ele_dmg_: skillParam_gen.constellation6[0],
  }
} as const

// Conditional Input
// Absorption Element
const condAbsorptionPath = [characterKey, "absorption"]
const condAbsorption = customStringRead(["conditional", ...condAbsorptionPath])
// A1 Swirl Reaction Element
const condSwirlReactionPath = [characterKey, "swirl"]
const condSwirlReaction = customStringRead(["conditional", ...condSwirlReactionPath])
// Set to "hit" if skill hit opponents
const condSkillHitOpponentPath = [characterKey, "skillHit"]
const condSkillHitOpponent = customStringRead(["conditional", ...condSkillHitOpponentPath])

// Conditional Output
// TODO: Check if total or premod
const asc1 = threshold_add(input.asc, 1,
  unmatch(target.charKey, characterKey,
    match(target.charEle, condSwirlReaction, datamine.passive1.eleMas)), { key: "eleMas" })
const asc4 = match("hit", condSkillHitOpponent,
  unmatch(target.charKey, characterKey,
    threshold_add(input.asc, 4,
      prod(percent(datamine.passive2.eleMas_), input.premod.eleMas))), { key: "eleMas" })
const c6Base = threshold_add(input.constellation, 6, percent(0.2))
// TODO: Add to team buff
const c6Bonus = objectFromKeyMap(absorbableEle.map(ele => `${ele}_dmg_` as const), key =>
  match(condAbsorption, key.slice(0, -5), c6Base, { key }))

export const dmgFormulas = {
  normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
    [i, dmgNode("atk", arr, "normal")])),
  charged: {
    dmg: dmgNode("atk", datamine.charged.dmg, "charged")
  },
  plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
    [key, dmgNode("atk", value, "plunging")])),
  skill: {
    press: dmgNode("atk", datamine.skill.press, "skill")
  },
  burst: {
    dot: dmgNode("atk", datamine.burst.dot, "burst"),
    ...Object.fromEntries(absorbableEle.map(key =>
      [key, match(condAbsorption, key, dmgNode("atk", datamine.burst.dmg_, "burst", { hit: { ele: constant(key) } }))]))
  },
}
export const data = dataObjForCharacterSheet(characterKey, "anemo", data_gen, dmgFormulas, {
  bonus: {
    talent: {
      skill: threshold_add(input.constellation, 3, 3),
      burst: threshold_add(input.constellation, 5, 3),
    }
  },
  premod: c6Bonus,
  teamBuff: {
    total: { eleMas: sum(asc1, asc4) }
  }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star as Rarity,
  elementKey: "anemo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talent: {
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [
          {
            text: tr(`auto.fields.normal`),
            fields: datamine.normal.hitArr.map((percentArr, i) => ({
              node: infoMut(dmgFormulas.normal[i], { key: `char_${characterKey}_gen:auto.skillParams.${i}` }),
            }))
          },
          {
            text: tr(`auto.fields.charged`),
            fields: [{
              node: infoMut(dmgFormulas.charged.dmg, { key: `char_${characterKey}_gen:auto.skillParams.4` }),
            }, {
              text: tr("auto.skillParams.5"),
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
          },
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            node: infoMut(dmgFormulas.skill.press, { key: `char_${characterKey}_gen:skill.skillParams.0` }),
          }, {
            text: tr("skill.skillParams.1"),
            value: datamine.skill.cd,
            unit: "s"
          }, {
            canShow: (data) => data.get(input.constellation).value >= 1,
            text: st("charges"),
            value: 2
          }]
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            node: infoMut(dmgFormulas.burst.dot, { key: `char_${characterKey}_gen:burst.skillParams.0` }),
          }, {
            text: tr("burst.skillParams.2"),
            value: data => data.get(input.constellation).value >= 2 ? `${datamine.burst.duration}s + 2` : datamine.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: datamine.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.4"),
            value: datamine.burst.enerCost,
          }],
          conditional: { // Absorption
            value: condAbsorption,
            path: condAbsorptionPath,
            name: st("eleAbsor"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: infoMut(dmgFormulas.burst[eleKey], { key: `char_${characterKey}_gen:burst.skillParams.1` }),
              }]
            }]))
          },
        }, {
          conditional: { // Absorption
            value: condAbsorption,
            path: condAbsorptionPath,
            header: conditionalHeader("constellation6", tr, c6),
            description: tr("constellation6.description"),
            name: st("eleAbsor"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: c6Bonus[`${eleKey}_dmg_`],
              }],
            }]))
          },
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
            name: <span>When <strong>Astable Anemohypostasis Creation - 6308 or Forbidden Creation - Isomer 75 / Type II</strong> hits an opponent</span>, // TODO: trans
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
