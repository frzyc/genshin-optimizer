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
import Character from '../../../Character/Character'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO

const hitPercent = [28, 30.1, 32.2, 35, 37.1, 39.2, 42, 44.8, 47.6, 50.4, 53.31, 57.12, 60.93, 64.74, 68.54]

const charged_atk_dmg = [174.08, 187.14, 200.19, 217.6, 230.66, 243.71, 261.12, 278.53, 295.94, 313.34, 331.45, 355.12, 378.8, 402.47, 426.15]
const charged_per_jade = [49.6, 53.32, 57.04, 62, 65.72, 69.44, 74.4, 79.36, 84.32, 89.28, 94.44, 101.18, 107.93, 114.68, 121.42]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const jadeScreen = {
  inheri_hp: [50.1, 53.1, 56.1, 60, 63, 66, 69.9, 73.8, 77.7, 81.6, 85.5, 89.4, 93.3, 97.2, 101.1],
  skill_dmg: [230.4, 247.68, 264.96, 288, 305.28, 322.56, 345.6, 368.64, 391.68, 414.72, 437.76, 460.8, 489.6, 518.4, 547.2],
}

//BURST
const starShatter = {
  dmg_per_gem: [86.96, 93.48, 100, 108.7, 115.22, 121.74, 130.44, 139.14, 147.83, 156.53, 165.22, 173.92, 184.79, 195.66, 206.53],
}

let char = {
  name: "Ningguang",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Opus Aequilibrium",
  titles: ["Eclipsing Star", "Lady of the Jade Chamber", "Tianquan of the Liyue Qixing"],
  baseStat: {
    characterHP: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
    characterATK: [18, 46, 59, 89, 98, 113, 125, 140, 150, 164, 174, 188, 198, 212],
    characterDEF: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
  },
  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Sparkling Scatter",
      img: normal,
      infusable: false,
      document: [(c, a) => ({
        text: <span><strong>Normal Attack</strong> Shoots gems that deal <span className="text-geo">{c >= 1 ? "AoE " : ""}Geo DMG</span>. Upon hit, this grants Ningguang 1 Star Jade.</span>,
        fields: [{
          text: `Normal Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{hitPercent[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (hitPercent[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: hitPercent[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }]
      }), {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of stamina to fire off a giant gem that deals <span className="text-geo">Geo DMG</span>. If Ningguang has any Star Jades, unleashing a Charged Attack will cause the Star Jades to be fired at the enemy as well, dealing additional DMG.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `DMG per Star Jade`,
          basicVal: (tlvl, stats, c) => <span>{charged_per_jade[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_per_jade[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_per_jade[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, (c, a) => ({
          text: `Stamina Cost`,
          value: <span>50{(a >= 1 ? <span>; With <b>Star Jade</b>: 0</span> : "")}</span>,
        })]
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
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
          basicVal: (tlvl, stats, c) => <span>{jadeScreen.inheri_hp[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
          finalVal: (tlvl, stats, c) => (jadeScreen.inheri_hp[tlvl] / 100) * stats.finalHP,
          formula: (tlvl, _, c) => ({ finalHP: jadeScreen.inheri_hp[tlvl] / 100 }),
        }, {
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{jadeScreen.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (jadeScreen.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: jadeScreen.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "CD",
          value: "12s",
        }, (c, a) => c >= 2 && {
          text: "Resets CD on shatter, every 6s",
        }, (c, a) => c >= 4 && {
          text: "Elemental DMG Reduc.",
          value: "10%",
        }, (c, a) => c >= 4 && {
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
          basicVal: (tlvl, stats, c) => <span>{starShatter.dmg_per_gem[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (starShatter.dmg_per_gem[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: starShatter.dmg_per_gem[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "CD",
          value: "12s",
        }, {
          text: "Energy Cost",
          value: 40,
        }, (c, a) => c >= 6 && {
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
        conditional: (tlvl, c, a) => a >= 4 && {
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
