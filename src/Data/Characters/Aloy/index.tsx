import card from './Character_Aloy_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Star_of_Another_World.png'
import c2 from './Constellation_Star_of_Another_World.png'
import c3 from './Constellation_Star_of_Another_World.png'
import c4 from './Constellation_Star_of_Another_World.png'
import c5 from './Constellation_Star_of_Another_World.png'
import c6 from './Constellation_Star_of_Another_World.png'
import normal from './Talent_Rapid_Fire.png'
import skill from './Talent_Frozen_Wilds.png'
import burst from './Talent_Prophecies_of_Dawn.png'
import passive1 from './Talent_Combat_Override.png'
import passive2 from './Talent_Strong_Strike.png'
import passive3 from './Talent_Easy_Does_It.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
const tr = (strKey: string) => <Translate ns="char_Aloy_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_Aloy" key18={strKey} />
const conditionals: IConditionals = {
  e: { //Gengu StormCall
    name: charTr("skill.coil"),
    states: {
      c1: {
        name: charTr("skill.coil1"),
        stats: stats => ({
          normal_dmg_: data.skill.coil1[stats.tlvl.skill]
        }),
      },
      c2: {
        name: charTr("skill.coil2"),
        stats: stats => ({
          normal_dmg_: data.skill.coil2[stats.tlvl.skill]
        })
      },
      c3: {
        name: charTr("skill.coil3"),
        stats: stats => ({
          normal_dmg_: data.skill.coil3[stats.tlvl.skill]
        })
      },
      c4: {
        name: charTr("skill.rush"),
        stats: stats => ({
          normal_dmg_: data.skill.coil4[stats.tlvl.skill],
          infusionSelf: "cryo",
        }),
        fields: [{
          text: tr("skill.skillParams.6"),
          value: data.skill.rushDur,
          unit: "s"
        },]
      }
    },
  },
  a4: {
    canShow: stats => {
      if (stats.ascension < 4) return false
      const value = stats.conditionalValues?.character?.Aloy?.sheet?.talent?.e as IConditionalValue | undefined
      if (!value) return false
      const [num, condEleKey] = value
      if (!num || condEleKey !== "c4") return false
      return true
    },
    name: charTr("skill.rushDur"),
    maxStack: 10,
    stats: {
      cryo_dmg_: 3.5
    }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: 5,//data_gen.star, TODO: not in datamine
  elementKey: "cryo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: <span>{sgt(`normal.hit${i + (i < 1 ? 1 : 0)}`)} {(i === 0 || i === 1) ? <span>({i + 1})</span> : ""}</span>,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          bowChargedDocSection(tr, formula, data, "cryo"),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: tr("skill.skillParams.0"),
            formulaText: stats => basicDMGFormulaText(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.1"),
            formulaText: stats => basicDMGFormulaText(data.skill.bomblet[stats.tlvl.skill], stats, "skill"),
            formula: formula.skill.bomblet,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.2"),
            value: stats => data.skill.atkDec[stats.tlvl.skill],
            fixed: 1,
            unit: "%"
          }, {
            text: tr("skill.skillParams.3"),
            value: data.skill.atkDecDur,
            unit: "s"
          }, {
            text: tr("skill.skillParams.7"),
            value: data.skill.cd,
            unit: "s"
          }],
          conditional: conditionals.e,
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.0"),
            formulaText: stats => basicDMGFormulaText(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.1"),
            value: data.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.2"),
            value: data.burst.cost,
          }]
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        stats: stats => {
          if (stats.ascension < 1) return null
          const value = stats.conditionalValues?.character?.Aloy?.sheet?.talent?.e as IConditionalValue | undefined
          if (!value) return null
          const [num,] = value
          if (!num) return null
          return {
            atk_: 16
          }//TODO: party buff atk_
        },
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            canShow: stats => {
              if (stats.ascension < 1) return false
              const value = stats.conditionalValues?.character?.Aloy?.sheet?.talent?.e as IConditionalValue | undefined
              if (!value) return false
              const [num,] = value
              if (!num) return false
              return true
            },
            text: sgt("duration"),
            value: data.a1.duration,
            unit: "s"
          }]
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
