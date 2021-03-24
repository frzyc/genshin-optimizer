import card from './Character_Xingqiu_Card.jpg'
import thumb from './Character_Xingqiu_Thumb.png'
import c1 from './Constellation_The_Scent_Remained.png'
import c2 from './Constellation_Rainbow_Upon_the_Azure_Sky.png'
import c3 from './Constellation_Weaver_of_Verses.png'
import c4 from './Constellation_Evilsoother.png'
import c5 from './Constellation_Embrace_of_Rain.png'
import c6 from './Constellation_Hence,_Call_Them_My_Own_Verses.png'
import normal from './Talent_Guhua_Style.png'
import skill from './Talent_Guhua_Sword_-_Fatal_Rainscreen.png'
import burst from './Talent_Guhua_Sword_-_Raincutter.png'
import passive1 from './Talent_Hydropathic.png'
import passive2 from './Talent_Blades_Amidst_Raindrops.png'
import passive3 from './Talent_Flash_of_Genius.png'
import Stat from '../../../Stat'
import DisplayPercent from '../../../Components/DisplayPercent'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"

const char = {
  name: "Xingqiu",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "hydro",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Fabulae Textile",
  titles: ["Juvenile Galant", "Guhua Guru of Feiyun Fame", "Guhua Geek"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Guhua Style",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes. <small><i>Note: the 3rd attack hits twice.</i></small></span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{i === 2 ? "2 × " : ""}{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: [{
          text: `Charged 1-Hit DMG`,
          formulaText: stats => <span>{data.charged.hit1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit1,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Charged 2-Hit DMG`,
          formulaText: stats => <span>{data.charged.hit2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit2,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 20,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: stats => getTalentStatKeyVariant("plunge", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: stats => getTalentStatKeyVariant("plunge", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: stats => getTalentStatKeyVariant("plunge", stats),
        }]
      }],
    },
    skill: {
      name: "Guhua Sword: Fatal Rainscreen",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Xingqiu performs twin strikes with his sword, dealing <span className="text-hydro">Hydro DMG</span>. At the same time, this ability creates the maximum number of Rain Swords, which will orbit your active character.</p>
          <p className="mb-2">The Rain Swords have the following properties:</p>
          <ul className="mb-2">
            <li>When a character takes DMG, the Rain Sword will shatter, reducing the amount of DMG taken.</li>
            <li>Increase the character's resistance to interruption.</li>
            <li>20% of Xingqiu's <span className="text-hydro">Hydro DMG Bonus</span> will be converted to additional DMG Reduction for the Rain Swords. The maximum amount of additional DMG Reduction that can be gained this way is 24%.</li>
            <li>The initial maximum number of Rain Swords is 3.</li>
            <li>Using this ability applies the <span className="text-hydro">Wet</span> status onto the character.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill 1-Hit DMG",
          formulaText: stats => <span>{data.skill.hit1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit1,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Skill 2-Hit DMG",
          formulaText: stats => <span>{data.skill.hit2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit2,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, stats => stats.constellation >= 4 && {
          text: "Skill 1-Hit DMG during RainCutter",
          formulaText: stats => <span> ( {data.skill.hit1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} ) * 150%</span>,
          formula: formula.skill.hit1RainCutter,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, stats => stats.constellation >= 4 && {
          text: "Skill 2-Hit DMG during RainCutter",
          formulaText: stats => <span> ( {data.skill.hit2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} ) * 150%</span>,
          formula: formula.skill.hit2RainCutter,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Damage Reduction Ratio(%)",
          formulaText: stats => <span>{data.skill.dmgRed[stats.tlvl.skill]}%  + min(24%, 20% * {Stat.printStat("hydro_dmg_", stats)} )</span>,
          formula: formula.skill.dmgRed,
          fixed: 2
        }, {
          text: "Sword Number",
          value: stats => stats.constellation >= 1 ? 4 : 3,
        }, {
          text: "Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "21s",
        }]
      }],
    },
    burst: {
      name: "Guhua Sword: Raincutter",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Initiate Rainbow Bladework and fight using an illusory sword rain, while creating the maximum number of Rain Swords.</p>
          <h6>Rainbow Bladework:</h6>
          <ul className="mb-2">
            <li>Your active character's Normal Attacks will trigger consecutive sword rain attacks, dealing <span className="text-hydro">Hydro DMG</span>.</li>
            <li>Rain Swords will remain at the maximum number throughout the ability's duration.</li>
            <li>These effects carry over to other characters.</li>
          </ul>
        </span>,
        fields: [{
          text: "Sword Rain DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: stats => stats.constellation >= 2 ? "18s" : "15s",
        }, {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 60,
        }]
      }],
    },
    passive1: {
      name: "Hydropathic",
      img: passive1,
      document: [{ text: stats => <span>When a <b>Rain Sword</b> is shattered or when its duration expires, it regenerates the current character's HP based on 6% of Xingqiu's Max HP{DisplayPercent(6, stats, "finalHP")}.</span> }],
    },
    passive2: {
      name: "Blades Amidst Raindrops",
      img: passive2,
      document: [{ text: <span>Xingqiu gains a 20% <span className="text-hydro">Hydro DMG Bonus</span>.</span> }],
      stats: stats => stats.ascension >= 4 && {
        hydro_dmg_: 20,
      }
    },
    passive3: {
      name: "Flash of Genius",
      img: passive3,
      document: [{ text: <span>When Xingqiu crafts Character Talent Materials, he has a 25% chance to refund a portion of the crafting materials used.</span> }],
    },
    constellation1: {
      name: "The Scent Remained",
      img: c1,
      document: [{ text: <span>Increases the maximum number of <b>Rain Swords</b> by 1.</span> }],
    },
    constellation2: {
      name: "Rainbow Upon the Azure Sky",
      img: c2,
      document: [{
        text: <span>Extends the duration of <b>Guhua Sword: Raincutter</b> by 3s. Decreases the <span className="text-hydro">Hydro RES</span> of opponents hit by sword rain by 15% for 4s.</span>,
        conditional: stats => stats.constellation >= 2 && {
          type: "character",
          conditionalKey: "RainbowUponTheAzureSky",
          condition: "Opponent hit by sword rain",
          sourceKey: "xingqiu",
          maxStack: 1,
          stats: {
            hydro_enemyRes_: -15,
          },
        },
      }],
    },
    constellation3: {
      name: "Weaver of Verses",
      img: c3,
      document: [{ text: <span>	Increases the level of <b>Guhua Sword: Raincutter</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Evilsoother",
      img: c4,
      document: [{ text: <span>Throughout the duration of <b>Guhua Sword: Raincutter</b>, the DMG dealt by <b>Guhua Sword: Fatal Rainscreen</b> is increased by 50%.</span> }],
    },
    constellation5: {
      name: "Embrace of Rain",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Guhua Sword: Fatal Rainscreen</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Hence, Call Them My Own Verses",
      img: c6,
      document: [{
        text: <span>
          <p className="mb-2">Activating 2 of <b>Guhua Sword: Raincutter</b>'s sword rain attacks greatly increases the DMG of the third. Xingqiu regenerates 3 Energy when sword rain attacks hit opponents.</p>
          <small>Note: this increase the amount of swords in the combo, but does not increase the individual sword DMG.</small>
        </span>
      }],
    }
  },
};
export default char;
