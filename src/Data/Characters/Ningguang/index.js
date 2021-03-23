import card from './Character_Ningguang_Card.jpg'
import thumb from './Character_Ningguang_Thumb.png'
import c1 from './Constellation_Piercing_Fragments.png'
import c2 from './Constellation_Shock_Effect.png'
import c3 from './Constellation_Majesty_be_the_Array_of_Stars.png'
import c4 from './Constellation_Exquisite_be_the_Jade,_Outshining_All_Beneath.png'
import c5 from './Constellation_Invincible_be_the_Jade_Screen.png'
import c6 from './Constellation_Grandeur_be_the_Seven_Stars.png'
import normal from './Talent_Sparkling_Scatter.png'
import skill from './Talent_Jade_Screen.png'
import burst from './Talent_Starshatter.png'
import passive1 from './Talent_Backup_Plan.png'
import passive2 from './Talent_Strategic_Reserve.png'
import passive3 from './Talent_Trove_of_Marvelous_Treasures.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Ningguang",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Opus Aequilibrium",
  titles: ["Eclipsing Star", "Lady of the Jade Chamber", "Tianquan of the Liyue Qixing"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Sparkling Scatter",
      img: normal,
      infusable: false,
      document: [{
        text: stats => <span><strong>Normal Attack</strong> Shoots gems that deal <span className="text-geo">{stats.constellation >= 1 ? "AoE " : ""}Geo DMG</span>. Upon hit, this grants Ningguang 1 Star Jade.</span>,
        fields: [{
          text: `Normal Attack DMG`,
          formulaText: stats => <span>{data.normal.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal.hit,
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }]
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of stamina to fire off a giant gem that deals <span className="text-geo">Geo DMG</span>. If Ningguang has any Star Jades, unleashing a Charged Attack will cause the Star Jades to be fired at the enemy as well, dealing additional DMG.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `DMG per Star Jade`,
          formulaText: stats => <span>{data.charged.jade[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.jade,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: stats => <span>50{(stats.ascension >= 1 ? <span>; With <b>Star Jade</b>: 0</span> : "")}</span>,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
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
      name: "Jade Screen",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">
            Ningguang creates a Jade Screen out of gold, obsidian and her great opulence, dealing <span className="text-geo">AoE Geo DMG</span>.
          </p>
          <h6>Jade Screen</h6>
          <ul className="mb-1">
            <li>Blocks opponents' projectiles.</li>
            <li>Endurance scales based on Ningguang's Max HP.</li>
          </ul>
          <p>
            Jade Screen is considered a <span className="text-geo">Geo Construct</span> and can be used to block certain attacks, but cannot be climbed. Only one Jade Screen may exist at a time.
            Generates 3 elemental particles when it hits at least 1 target.
          </p>
        </span>,
        fields: [{
          text: "Inherited HP",
          formulaText: stats => <span>{data.skill.inheri_hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)}</span>,
          formula: formula.skill.inheri_hp,
        }, {
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "12s",
        }, stats => stats.constellation >= 2 && {
          text: "Resets CD on shatter, every 6s",
        }, stats => stats.constellation >= 4 && {
          text: "Elemental DMG Reduc.",
          value: "10%",
        }, stats => stats.constellation >= 4 && {
          text: "Elemental DMG Reduc. Range",
          value: "10m",
        }]
      }],
    },
    burst: {
      name: "Starshatter",
      img: burst,
      document: [{
        text: <span>
          Gathering a great number of gems, Ningguang scatters them all at once, sending homing projectiles at her opponents that deal massive <span className="text-geo">Geo DMG</span>.
          If Starshatter is cast when a <b>Jade Screen</b> is nearby, the Jade Screen will fire additional gem projectiles at the same time.
        </span>,
        fields: [{
          text: "DMG Per Gem",
          formulaText: stats => <span>{data.burst.dmg_per_gem[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg_per_gem,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "CD",
          value: "12s",
        }, {
          text: "Energy Cost",
          value: 40,
        }, stats => stats.constellation >= 6 && {
          text: "Star Jade gained",
          value: "7",
        }]
      }],
    },
    passive1: {
      name: "Backup Plan",
      img: passive1,
      document: [{ text: <span>When Ningguang is in possession of <b>Star Jades</b>, her <b>Charged Attack</b> does not consume Stamina.</span> }],
    },
    passive2: {
      name: "Strategic Reserve",
      img: passive2,
      document: [{
        text: <span>A character that passes through the <b>Jade Screen</b> will gain a 12% <span className="text-geo">Geo DMG Bonus</span> for 10s.</span>,
        conditional: stats => stats.ascension >= 4 && {
          type: "character",
          conditionalKey: "StrategicReserve",
          condition: "Strategic Reserve",
          sourceKey: "ningguang",
          maxStack: 1,
          stats: {
            geo_dmg_: 12
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    passive3: {
      name: "Trove of Marvelous Treasures",
      img: passive3,
      document: [{ text: <span>Displays the location of nearby ore veins (Iron Ore, White Iron Ore, Crystal Ore, Magical Crystal Ore, and Starsilver) on the mini-map.</span> }],
    },
    constellation1: {
      name: "Piercing Fragments",
      img: c1,
      document: [{ text: <span>When a <b>Normal Attack</b> hits, it deals AoE DMG.</span> }],
    },
    constellation2: {
      name: "Shock Effect",
      img: c2,
      document: [{ text: <span>	When <b>Jade Screen</b> is shattered, its CD will reset. This effect can only take place every 6 seconds.</span> }],
    },
    constellation3: {
      name: "Majesty be the Array of Stars",
      img: c3,
      document: [{ text: <span>	Increases Starshatter's skill level by 3. Max level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Exquisite be the Jade, Outshining All Beneath",
      img: c4,
      document: [{ text: <span>Allies within a 10m radius of the Jade Screen take 10% less Elemental DMG.</span> }],
    },
    constellation5: {
      name: "Invincible be the Jade Screen",
      img: c5,
      document: [{ text: <span>Increases <b>Jade Screen</b>'s skill level by 3. Max level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Grandeur be the Seven Stars",
      img: c6,
      document: [{ text: <span>When Starshatter is used, Ningguang gains 7 Star Jades.</span> }],
    }
  },
};
export default char;
