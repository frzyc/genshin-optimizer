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
import { getTalentStatKeyVariant } from "../../../Build/Build"
import { absorbableEle } from '../dataUtil'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, conditionalHeader, normalSrc, plungeDocSection, sgt, talentTemplate } from '../SheetUtil_WR'
import { allElements, WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
import { input } from "../../../Formula/index";
import { dataObjForCharacterSheet, dmgNode } from "../../../Formula/api";
import { prod, threshold_add } from "../../../Formula/utils";
import { ICharacterSheet } from '../../../Types/character_WR'

const tr = (strKey: string) => <Translate ns="char_Sucrose_gen" key18={strKey} />

const datamine = {
  normal: {
    hitArr: [
      [33.46, 35.97, 38.48, 41.83, 44.34, 46.85, 50.2, 53.54, 56.89, 60.24, 63.58, 66.93, 71.11, 75.29, 79.48], // 1
      [30.62, 32.91, 35.21, 38.27, 40.57, 42.86, 45.92, 48.99, 52.05, 55.11, 58.17, 61.23, 65.06, 68.89, 72.71], // 2
      [38.45, 41.33, 44.22, 48.06, 50.94, 53.83, 57.67, 61.52, 65.36, 69.21, 73.05, 76.9, 81.7, 86.51, 91.31], // 3
      [47.92, 51.51, 55.11, 59.9, 63.49, 67.08, 71.88, 76.67, 81.46, 86.25, 91.04, 95.84, 101.82, 107.81, 113.8], // 4
    ]
  },
  charged: {
    dmg: [120.16, 129.17, 138.18, 150.2, 159.21, 168.22, 180.24, 192.26, 204.27, 216.29, 228.3, 240.32, 255.34, 270.36, 285.38],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    press: [211.2, 227.04, 242.88, 264, 279.84, 295.68, 316.8, 337.92, 359.04, 380.16, 401.28, 422.4, 448.8, 475.2, 501.6],
  },
  burst: {
    dot: [148, 159.1, 170.2, 185, 196.1, 207.2, 222, 236.8, 251.6, 266.4, 281.2, 296, 314.5, 333, 351.5],
    dmg_: [44, 47.3, 50.6, 55, 58.3, 61.6, 66, 70.4, 74.8, 79.2, 83.6, 88, 93.5, 99, 104.5],
  }
}
export const data = dataObjForCharacterSheet("Sucrose", "anemo",
  { base: data_gen.base.hp, lvlCurve: data_gen.curves.hp, asc: data_gen.ascensions.map(x => x.props.hp) },
  { base: data_gen.base.atk, lvlCurve: data_gen.curves.atk, asc: data_gen.ascensions.map(x => x.props.atk) },
  { base: data_gen.base.def, lvlCurve: data_gen.curves.def, asc: data_gen.ascensions.map(x => x.props.def) },
  { stat: "anemo_dmg_", asc: data_gen.ascensions.map(x => x.props.anemo_dmg_) },
  {
    normal: Object.fromEntries(datamine.normal.hitArr.map((arr, i) =>
      [i, dmgNode("atk", arr, "normal")])),
    charged: Object.fromEntries(Object.entries(datamine.charged).map(([key, value]) =>
      [key, dmgNode("atk", value, "charged")])),
    plunging: Object.fromEntries(Object.entries(datamine.plunging).map(([key, value]) =>
      [key, dmgNode("atk", value, "plunging")])),
    skill: Object.fromEntries(Object.entries(datamine.skill).map(([key, value]) =>
      [key, dmgNode("atk", value, "skill")])),
    burst: {
      dot: dmgNode("atk", datamine.burst.dot, "burst"),
      ...Object.fromEntries(absorbableEle.map(key =>
        [key, dmgNode("atk", datamine.burst.dmg_, "burst", { /** Set absorption element */ })]))
    },
  },
  {
    // TODO: include
    // Teambuff: A1, A4,
    // Misc: C1, C2, C4
    char: {
      skill: threshold_add(input.char.asc, 3, 3),
      burst: threshold_add(input.char.asc, 5, 3),
    },
    dmgBonus: {
      // TODO: Add conditional
      ...Object.fromEntries(allElements.map(ele => [ele, threshold_add(input.char.constellation, 6, 0.2)])),
    }
  }
)

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
            fields: datamine.normal.hitArr.map((percentArr, i) =>
            ({
              text: sgt(`normal.hit${i + 1}`),
              formula: ["number", "display", "normal", i.toString()],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          chargedDocSection(tr, 50),
          plungeDocSection(tr),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Skill DMG",
            formula: ["number", "display", "skill", "press"],
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "15s"
          }]
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "DoT",
            formula: ["number", "display", "burst", "dot"],
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: "6s"
          }, {
            text: "CD",
            value: "20s"
          }, {
            text: "Energy Cost",
            value: "80"
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
                text: "Absorption DoT",
                formula: ["number", "display", "burst", eleKey],
                variant: eleKey
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
              stats: { [`${eleKey}_dmg_`]: 20 }
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
              formula: ["number", "postmod", "eleMas"]
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
