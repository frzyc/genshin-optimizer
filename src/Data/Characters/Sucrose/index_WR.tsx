import card from './Character_Sucrose_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './constellation1.png'
import c2 from './constellation2.png'
import c3 from './constellation3.png'
import c4 from './constellation4.png'
import c5 from './constellation5.png'
import c6 from './constellation6.png'
import skill from './skill.png'
import burst from './burst.png'
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import data_gen from './data_gen.json'
import { absorbableEle, dataObjForCharacterSheet, dmgNode } from '../dataUtil'
import { Translate } from '../../../Components/Translate'
import { conditionalHeader, normalSrc, sgt, talentTemplate } from '../SheetUtil_WR'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
import { input } from "../../../Formula/index";
import { customRead, customStringRead, infoMut, match, percent, prod, stringConst, sum, threshold_add, unmatch } from "../../../Formula/utils";
import { ICharacterSheet } from '../../../Types/character_WR'
import { objectFromKeyMap } from '../../../Util/Util'
import skillParam_gen_pre from './skillParam_gen.json'

const characterKey: CharacterKey = "Sucrose"
const tr = (strKey: string) => <Translate ns={`char_${characterKey}_gen`} key18={strKey} />

const skillParam_gen = skillParam_gen_pre as any
let a = 0, s = 0, b = 0, p1, p2 = 0
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
    eleMas: skillParam_gen.passive1[p1++],
    duration: skillParam_gen.passive1[p1++],
  },
  passive2: {
    eleMas_: skillParam_gen.passive2[p2++],
    duration: skillParam_gen.passive2[p2++],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    ele_dmg_: skillParam_gen.constellation6[0],
  }
} as const
// TODO: Hook these to the Sheet/UI

// Conditional Input
// Absorption Element
const condAbsorption = customStringRead(["conditional", characterKey, "absorption"])
// A1 Swirl Reaction Element
const condSwirlReaction = customStringRead(["conditional", characterKey, "swirl"])
// Set to 1 if skill hit opponents
const condSkillHitOpponent = customRead(["conditional", characterKey, "skillHit"])

// Conditional Output
// TODO: Check if total or premod
// TODO: Use on-field char element
// TODO: Add to team buff
const asc1 = match(input.charEle, condSwirlReaction, threshold_add(input.asc, 1, 80), { key: "eleMas" })
// TODO: Use on-field char key
// TODO: Add to team buff
const asc4 = threshold_add(condSkillHitOpponent, 1, unmatch(input.charKey, characterKey,
  threshold_add(input.asc, 4, prod(percent(0.2), input.premod.eleMas))), { key: "eleMas" })
const c6Base = threshold_add(input.constellation, 6, percent(0.2))
// TODO: Add to team buff
const c6Bonus = objectFromKeyMap(absorbableEle, ele =>
  match(condAbsorption, ele, c6Base, { key: `${ele}_dmg_` }))

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
      [key, match(condAbsorption, key, dmgNode("atk", datamine.burst.dmg_, "burst", { hit: { ele: stringConst(key) } }))]))
  },
}
export const data = dataObjForCharacterSheet(characterKey, "anemo", data_gen, dmgFormulas, {
  // TODO: include
  // Teambuff: A1, A4,
  // Misc: C1, C2, C4
  talent: {
    boost: {
      skill: threshold_add(input.constellation, 3, 3),
      burst: threshold_add(input.constellation, 5, 3),
    }
  },
  total: { eleMas: sum(asc1, asc4) },
  bonus: { dmg: c6Bonus }
})

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
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
            value: datamine.burst.duration,
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
            key: "q",
            name: "Elemental Absorption",
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                canShow: stats => {
                  const [num, condEleKey] = stats.conditionalValues?.character?.Sucrose?.q ?? []
                  return !!num && condEleKey === eleKey
                },
                node: infoMut(dmgFormulas.burst[eleKey], { key: `char_${characterKey}_gen:burst.skillParams.1` }),
              }]
            }]))
          },
        }, {
          conditional: { // Absorption
            key: "c6",
            partyBuff: "partyAll",
            header: conditionalHeader("constellation6", tr, c6),
            description: tr("constellation6.description"),
            name: "Elemental Absorption",
            canShow: stats => stats.constellation >= 6,
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              stats: { [`${eleKey}_dmg_`]: 20 } //TODO: remove?
            }]))
          },
        }]
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: {
            key: "a1",
            canShow: stats => stats.ascension >= 4,
            partyBuff: "partyOnly",
            header: conditionalHeader("passive1", tr, passive1),
            description: tr("passive1.description"),
            name: "When Sucrose triggers a Swirl reaction",
            fields: [{
              text: <ColorText color="warning">This Team buff currently does not work. please add the EM manually to the characer.</ColorText>
            }]
          }
        }]
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: {
            key: "a4",
            canShow: stats => stats.ascension >= 4,
            partyBuff: "partyOnly",
            header: conditionalHeader("passive2", tr, passive2),
            description: tr("passive2.description"),
            name: "When Skill hits opponent",
            fields: [{
              text: "Elemental Mastery Bonus",
              node: input.total.eleMas // TODO: Find the node for this one
            }, {
              text: sgt("duration"),
              value: 8,
              unit: "s"
            }]
          }
        }]
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, "skillBoost"),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, "burstBoost"),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default sheet
