import { CharacterData } from 'pipeline'
import ColorText from '../../../Components/ColoredText'
import { input, target } from "../../../Formula/index"
import { constant, equal, greaterEq, infoMut, percent, prod, unequal } from "../../../Formula/utils"
import { absorbableEle, CharacterKey, ElementKey } from '../../../Types/consts'
import { objectKeyMap } from '../../../Util/Util'
import { cond, sgt, st, trans } from '../../SheetUtil'
import CharacterSheet, { conditionalHeader, ICharacterSheet, normalSrc, talentTemplate } from '../CharacterSheet'
import { dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { banner, burst, c1, c2, c3, c4, c5, c6, card, passive1, passive2, passive3, skill, thumb, thumbSide } from './assets'
import data_gen_src from './data_gen.json'
import skillParam_gen from './skillParam_gen.json'

const data_gen = data_gen_src as CharacterData
const characterKey: CharacterKey = "Sucrose"
const elementKey: ElementKey = "anemo"
const [tr, trm] = trans("char", characterKey)

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

const [condAbsorptionPath, condAbsorption] = cond(characterKey, "absorption")
// A1 Swirl Reaction Element
const [condSwirlReactionPath, condSwirlReaction] = cond(characterKey, "swirl")
// Set to "hit" if skill hit opponents
const [condSkillHitOpponentPath, condSkillHitOpponent] = cond(characterKey, "skillHit")

// Conditional Output
const asc1Condition = greaterEq(input.asc, 1,
  unequal(target.charKey, characterKey,
    equal(target.charEle, condSwirlReaction, 1)))
const asc1 = equal(asc1Condition, 1, datamine.passive1.eleMas)
const asc4Disp = equal("hit", condSkillHitOpponent,
    greaterEq(input.asc, 4,
      prod(percent(datamine.passive2.eleMas_), input.premod.eleMas)))
const asc4 = unequal(target.charKey, characterKey, asc4Disp)
const c6Base = greaterEq(input.constellation, 6, percent(0.2))

const c6Bonus = objectKeyMap(absorbableEle.map(ele => `${ele}_dmg_` as const), key =>
  equal(condAbsorption, key.slice(0, -5), c6Base))

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
      [key, equal(condAbsorption, key, dmgNode("atk", datamine.burst.dmg_, "burst", { hit: { ele: constant(key) } }))]))
  },
}

const nodeC3 = greaterEq(input.constellation, 3, 3)
const nodeC5 = greaterEq(input.constellation, 5, 3)
export const data = dataObjForCharacterSheet(characterKey, elementKey, "mondstadt", data_gen, dmgFormulas, {
  bonus: {
    skill: nodeC3,
    burst: nodeC5,
  },
  teamBuff: {
    total: { eleMas: asc4 },
    premod: { ...c6Bonus, eleMas: asc1 },
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
            text: tr(`auto.fields.normal`),
            fields: datamine.normal.hitArr.map((_, i) => ({
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
            header: conditionalHeader("burst", tr, burst),
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
            teamBuff: true,
            canShow: greaterEq(input.constellation, 6, 1),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                node: c6Bonus[`${eleKey}_dmg_`],
              }],
            }]))
          },
        }]
      },
      passive1: talentTemplate("passive1", tr, passive1, undefined, {
        // Swirl Element
        teamBuff: true,
        value: condSwirlReaction,
        path: condSwirlReactionPath,
        name: st("eleSwirled"),
        canShow: greaterEq(input.asc, 1, unequal(target.charKey, characterKey, 1)),
        states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
          name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
          fields: [{
            node: asc1,
          }, {
            // TODO: uncomment after `target` bug is fixed
            // canShow: data => data.get(asc1Condition).value,
            text: sgt("duration"),
            value: datamine.passive1.duration,
            unit: "s",
          }],
        }]))
      }),
      passive2: talentTemplate("passive2", tr, passive2, undefined, {
        // Swirl element
        teamBuff: true,
        value: condSkillHitOpponent,
        path: condSkillHitOpponentPath,
        name: trm("asc4"),
        canShow: greaterEq(input.asc, 4, unequal(input.activeCharKey, characterKey, 1)),
        states: {
          hit: {
            fields: [{
              node: infoMut(asc4Disp, { key: "eleMas" }),
            }, {
              text: sgt("duration"),
              value: datamine.passive2.duration,
              unit: "s"
            }],
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
