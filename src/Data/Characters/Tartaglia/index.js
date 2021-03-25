import card from './Character_Tartaglia_Card.png'
import thumb from './Character_Tartaglia_Thumb.png'
import c1 from './Constellation_Foul_Legacy_Tide_Withholder.png'
import c2 from './Constellation_Foul_Legacy_Understream.png'
import c3 from './Constellation_Abyssal_Mayhem_Vortex_of_Turmoil.png'
import c4 from './Constellation_Abyssal_Mayhem_Hydrosprout.png'
import c5 from './Constellation_Havoc_Formless_Blade.png'
import c6 from './Constellation_Havoc_Annihilation.png'
import normal from './Talent_Cutting_Torrent.png'
import skill from './Talent_Foul_Legacy_Raging_Tide.png'
import burst from './Talent_Havoc_Obliteration.png'
import passive1 from './Talent_Never_Ending.png'
import passive2 from './Talent_Sword_of_Torrents.png'
import passive3 from './Talent_Master_of_Weaponry.png'
import Stat from '../../../Stat'
import formula, {data} from './data'
import {getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Tartaglia",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "hydro",
  weaponTypeKey: "bow",
  gender: "M",
  constellationName: "Monoceros Caeli",
  titles: ["Childe", "11th of the Eleven Fatui Harbingers"],
  baseStat: data.baseStat,
  specializedStat: data.specializedStat,
  formula,
  talent: {
    auto: {
      name: "Cutting Torrent",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: `${i + 1}-Hit DMG`,
              formulaText: stats =>
                  <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, the power of Hydro will accumulate on the arrowhead. A arrow fully charged with the torrent will deal <span className="text-hydro">Hydro DMG</span> and apply the Riptide status.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          formulaText: stats =>
              <span>{data.charged.aimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.aimShot,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: <span>Fully-Charged Aimed Shot DMG</span>,
          formulaText: stats => <span>{data.charged.fullyAimedShot[stats.tlvl.auto]}% {Stat.getStatName(getTalentStatKey("charged", stats, true))}</span>,
          formula: formula.charged.fullyAimedShot,
          variant: stats => getTalentStatKeyVariant("charged", stats, true),
        }]
      }, { //TODO riptide
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }]
      }],
    },
    skill: {
        name: "Foul Legacy: Raging Tide",
        img: skill,
        document: [{
            text: <span>Unleashes a set of weaponry made of pure water, dealing <span className="text-hydro">Hydro DMG</span> to surrounding opponents and entering Melee Stance.</span>,
            fields: [{
            text: "Skill DMG",
                formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
                    formula: formula.skill.skillDmg,
                    variant: stats => getTalentStatKeyVariant("skill", stats),
            }, {

            }],
        }],
    },
    burst: {},
    passive1: {},
    passive2: {},
    passive3: {},
    constellation1: {},
    constellation2: {},
    constellation3: {},
    constellation4: {},
    constellation5: {},
    constellation6: {},
  },
};
export default char;
