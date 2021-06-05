import card from './Traveler_Male_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import c1 from './Constellation_Invincible_Stonewall.png'
import c2 from './Constellation_Rockcore_Meltdown.png'
import c3 from './Constellation_Will_of_the_Rock.png'
import c4 from './Constellation_Reaction_Force.png'
import c5 from './Constellation_Meteorite_Impact.png'
import c6 from './Constellation_Everlasting_Boulder.png'
import normal from './Talent_Foreign_Rockblade.png'
import skill from './Talent_Starfell_Sword.png'
import burst from './Talent_Wake_of_Earth.png'
import passive1 from './Talent_Shattered_Darkrock.png'
import passive2 from './Talent_Frenzied_Rockslide.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { ICharacterSheet } from '../../../Types/character';
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'

const conditionals: IConditionals = {
  c1: { // InvincibleStonewall
    canShow: stats => stats.constellation >= 1,
    name: <span>Party members within the radius of <b>Wake of Earth</b>.</span>,
    stats: { critRate_: 10 }
  }
}
const char: ICharacterSheet = {
  name: "Traveler (Geo)",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: "Viator",//male const
  titles: ["Outlander", "Honorary Knight"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  conditionals,
  talent: {
    auto: {
      name: "Foreign Rockblade",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: data.charged.hitArr.map((percentArr, i) =>
        ({
          text: i == 1 ? `Male Charged 2-Hit DMG`: (i == 2 ? `Female Charged 2-Hit DMG` : `Charged ${i + 1}-Hit DMG`),
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged[i],
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }))
      }, {
        text: <span><strong>Plunging Attack</strong> Plugnes from mid-air to strike the ground below, damaing enemies along the path and ealing AoE DMG upon impact.</span>,
        fields: [{
          text: "Plunge DMG",
          formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: "Low Plunge DMG",
          formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: "High Plunge DMG",
          formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }]
      }]
    },
    skill: {
      name: "Starfell Sword",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">You disgorge a meteorite from the depths of the earth, dealing <span className="text-geo">AoE Geo DMG</span>.</p>
          <p className="mb-2">
            <strong>Hold:</strong> This skill's positioning may be adjusted.
          </p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          canShow: stats => stats.constellation >= 2,
          text: "Meteorite Explosion DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Base CD",
          value: stats => stats.ascension >= 1 ? "6s" : "8s",
        }, {
          text: "Meteorite Duration",
          value: stats => stats.ascension >= 6 ? "40s" : "30s",
        }],
      }],
    },
    burst: {
      name: "Wake of Earth",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Energizing the Geo deep underground, you set off expanding shockwaves.</p>
          <p>Launches surrounding opponents back and deals <span className="text-geo">AoE Geo DMG</span>.</p>
          <p>A stone wall is erected at the edges of the shockwave.</p>
          <p>The stone wall is considered a Geo Construct, and may be used to block attacks.</p>
        </span>,
        fields: [{
          text: "DMG Per Shockwave",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Stonewall Duration",
          value: stats => stats.constellation >= 6 ? "20s" : "15s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
      }],
    },
    passive1: {
      name: "Shattered Darkrock",
      img: passive1,
      document: [{text: <span>Reduces <b>Starfell Swords's</b> CD by 2s/</span>}]
    },
    passive2: {
      name: "Frenzied Rockslide",
      img: passive2,
      document: [{
        text: <span>The last hit of a Normal Attack combo unleases a collapse blade, dealing 60% of ATK as <span className="text-geo">Aoe Geo DMG</span>.</span>,
        fields: [{
          text: "Geo Auto",
          formulaText: stats => <span>60% * {Stat.printStat("finalATK", stats)}</span>,
          formula: formula.passive2.geoAuto,
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }]
      }]
    },
    constellation1: {
      name: "Invincible Stonewall",
      img: c1,
      document: [{ 
        text: <span>Party members within the radius of <b>Wake of Earth</b> have their CRIT Rate increased by 10% and have increased resistance against interruption.</span>,
        conditional: conditionals.c1
      }]
    },
    constellation2: {
      name: "Rockcore Meltdown",
      img: c2,
      document: [{
        text: <span>When the meteorite created by <b>Starfell Sword</b> is destroyed, it will also explode, dealing additional <span className="text-geo">AoE Geo DMG</span> equal to the amount of damage dealt by <b>Starfell Sword</b>.</span>
      }]
    },
    constellation3: {
      name: "Will of the Rock",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Wake of Earth</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { burstBoost: 3 }
    },
    constellation4: {
      name: "Reaction Force",
      img: c4,
      document: [{ text: <span>The shockwave triggered by <b>Wake of Earth</b> regenerates 5 Energy for every opponent hit. A maximum of 25 Energy can be regenerated in this manner at any one time.</span> }]
    },
    constellation5: {
      name: "Meteorite Impact",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Starfell Sword</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { skillBoost: 3 }
    },
    constellation6: {
      name: "Everlasting Boulder",
      img: c6,
      document: [{ text: <span>The barrier created by <b>Wake of Earth</b> lasts 5s longer. The meteorite created by <b>Starfell Sword</b> lasts 10s longer.</span> }]
    },
  }
};
export default char;