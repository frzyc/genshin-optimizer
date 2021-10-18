import card from './Character_Bennett_Card.jpg'
import thumb from './Character_Bennett_Thumb.png'
import c1 from './Constellation_Grand_Expectation.png'
import c2 from './Constellation_Impasse_Conqueror.png'
import c3 from './Constellation_Unstoppable_Fervor.png'
import c4 from './Constellation_Unexpected_Odyssey.png'
import c5 from './Constellation_True_Explorer.png'
import c6 from './Constellation_Fire_Ventures_with_Me.png'
import normal from './Talent_Strike_of_Fortune.png'
import skill from './Talent_Passion_Overload.png'
import burst from './Talent_Fantastic_Voyage.png'
import passive1 from './Talent_Rekindle.png'
import passive2 from './Talent_Fearnaught.png'
import passive3 from './Talent_It_Should_Be_Safe....png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { chargedHitsDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'

const path = KeyPath<FormulaPathBase, any>().character.Bennett
const tr = (strKey: string) => <Translate ns="char_Bennett_gen" key18={strKey} />
const conditionals: IConditionals = {
  q: { // Fantastic Voyage
    name: tr("burst.name"),
    stats: stats => ({
      modifiers: { atk: [path.burst.atkBonus()] },
      ...(stats.constellation >= 6 ? { infusionSelf: "pyro" } : {})
    }),
    fields: [{
      text: "ATK Bonus Ratio",
      formulaText: stats => <span>{stats.constellation < 1 ? data.burst.atkRatio[stats.tlvl.burst] : `(${data.burst.atkRatio[stats.tlvl.burst]} + 20)`}% {Stat.printStat("baseATK", stats, true)}</span>,
      formula: formula.burst.atkBonus
    },]
  },
  c2: { // Impasse Conqueror
    canShow: stats => stats.constellation >= 2,
    name: "When HP falls below 70%",
    stats: { enerRech_: 30 }
  },
  c6: { // Fire Ventures With Me
    canShow: stats => stats.constellation >= 6,
    name: "Sword, Claymore, or Polearm-wielding characters inside Fantastic Voyage's radius",
    stats: { pyro_dmg_: 15 },
    fields: [{
      text: <ColorText color="pyro">Pyro infusion</ColorText>,//TODO: infusion as a stat
    }]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: data_gen.star,
  elementKey: "pyro",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
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
          normalDocSection(tr, formula, data),
          chargedHitsDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            ...[["press", "Press DMG"], ["lvl1hit1", "Lvl 1 1st Hit DMG"], ["lvl1hit2", "Lvl 1 2nd Hit DMG"], ["lvl2hit1", "Lvl 2 1st Hit DMG"], ["lvl2hit2", "Lvl 2 2nd Hit DMG"], ["explosion", "Explosion DMG"]].map(([key, text]) => ({
              text,
              formulaText: stats => <span>{data.skill[key][stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill[key],
              variant: stats => getTalentStatKeyVariant("skill", stats),
            })), {
              text: "CD",
              value: stats => stats.ascension >= 1 ? "4s / 6s/ 8s" : "5s / 7.5s/ 10s",
            }, {
              text: <span>CD in <b>Fantastic Voyage</b>'s circle</span>,
              value: "2s / 3s/ 4s",
            }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Continuous Regeneration Per Sec",
            formulaText: stats => <span>( {data.burst.healHP[stats.tlvl.burst]}% Max HP + {data.burst.healHPFlat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.regen,
            variant: "success",
          }, {
            text: "Duration",
            value: "12s",
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }],
          conditional: conditionals.q
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6
        }],
      },
    },
  },
};
export default char;
