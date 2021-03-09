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
import Character from '../../../Character/Character'
import DisplayPercent from '../../../Components/DisplayPercent'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO
const hitPercent = [
  [46.61, 50.41, 54.2, 59.62, 63.41, 67.75, 73.71, 79.67, 85.64, 92.14, 99.59, 108.36, 117.12, 125.88, 135.45],//1
  [47.64, 51.52, 55.4, 60.94, 64.82, 69.25, 75.34, 81.44, 87.53, 94.18, 101.8, 110.76, 119.71, 128.67, 138.44],//2
  [28.55, 30.88, 33.2, 36.52, 38.84, 41.5, 45.15, 48.8, 52.46, 56.44, 61.01, 66.37, 71.74, 77.11, 82.97],//3 x2
  [55.99, 60.54, 65.1, 71.61, 76.17, 81.38, 88.54, 95.7, 102.86, 110.67, 119.62, 130.15, 140.67, 151.2, 162.68],//4
  [35.86, 38.78, 41.7, 45.87, 48.79, 52.13, 56.71, 61.3, 65.89, 70.89, 76.62, 83.37, 90.11, 96.85, 104.21],//5
]

const charged = {
  hit1: [47.3, 51.15, 55, 60.5, 64.35, 68.75, 74.8, 80.85, 86.9, 93.5, 101.06, 109.96, 118.85, 127.74, 137.45],
  hit2: [56.16, 60.73, 65.3, 71.83, 76.4, 81.63, 88.81, 95.99, 103.17, 111.01, 119.99, 130.55, 141.11, 151.67, 163.18]
}
const plunging_dmg = [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98]
const plunging_dmg_low = [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89]
const plunging_dmg_high = [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]

//SKILL
const eleSkill = {
  skill_dmg_1: [168, 180.6, 193.2, 210, 222.6, 235.2, 252, 268.8, 285.6, 302.4, 319.2, 336, 357, 378, 399],
  skill_dmg_2: [191.2, 205.54, 219.88, 239, 253.34, 267.68, 286.8, 305.92, 325.04, 344.16, 363.28, 382.4, 406.3, 430.2, 454.1],
  dmg_red: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29, 29, 29, 29, 29],

}

//BURST
const eleBurst = {
  burst_dmg: [54.27, 58.34, 62.41, 67.84, 71.91, 75.98, 81.41, 86.84, 92.26, 97.69, 103.12, 108.54, 115.33, 122.11, 128.9],
}

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
  baseStat: {
    characterHP: [857, 2202, 2842, 4257, 4712, 5420, 6027, 6735, 7190, 7897, 8352, 9060, 9515, 10222],
    characterATK: [17, 43, 56, 84, 93, 107, 119, 133, 142, 156, 165, 179, 188, 202],
    characterDEF: [64, 163, 211, 316, 349, 402, 447, 499, 533, 585, 619, 671, 705, 758]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Guhua Style",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes. <small><i>Note: the 3rd attack hits twice.</i></small></span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats, c) => <span>{i === 2 ? "2 × " : ""}{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          formula: (tlvl, stats, c) => (i === 2 ? 2 : 1) * (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: [{
          text: `Charged 1-Hit DMG`,
          formulaText: (tlvl, stats, c) => <span>{charged.hit1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          formula: (tlvl, stats, c) => (charged.hit1[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Charged 2-Hit DMG`,
          formulaText: (tlvl, stats, c) => <span>{charged.hit2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          formula: (tlvl, stats, c) => (charged.hit2[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: 20,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
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
          formulaText: (tlvl, stats, c) => <span>{eleSkill.skill_dmg_1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          formula: (tlvl, stats, c) => (eleSkill.skill_dmg_1[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Skill 2-Hit DMG",
          formulaText: (tlvl, stats, c) => <span>{eleSkill.skill_dmg_2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          formula: (tlvl, stats, c) => (eleSkill.skill_dmg_2[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (con) => con >= 4 && {
          text: "Skill 1-Hit DMG during RainCutter",
          formulaText: (tlvl, stats, c) => <span> ( {eleSkill.skill_dmg_1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)} ) * 150%</span>,
          formula: (tlvl, stats, c) => (eleSkill.skill_dmg_1[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)] * 1.5,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (con) => con >= 4 && {
          text: "Skill 2-Hit DMG during RainCutter",
          formulaText: (tlvl, stats, c) => <span> ( {eleSkill.skill_dmg_2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)} ) * 150%</span>,
          formula: (tlvl, stats, c) => (eleSkill.skill_dmg_2[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)] * 1.5,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Damage Reduction Ratio(%)",
          formulaText: (tlvl, stats, c) => <span>{eleSkill.dmg_red[tlvl]}%  + min(24%, 20% * {Stat.printStat("hydro_dmg_", stats)} )</span>,
          formula: (tlvl, stats, c) => eleSkill.dmg_red[tlvl] + Math.min(24, 0.2 * stats.hydro_dmg_),
          fixed: 2
        }, (con, a) => ({
          text: "Sword Number",
          value: con >= 1 ? 4 : 3,
        }), {
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
          formulaText: (tlvl, stats, c) => <span>{eleBurst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          formula: (tlvl, stats, c) => (eleBurst.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, (con, a) => ({
          text: "Duration",
          value: con >= 2 ? "18s" : "15s",
        }), {
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
      document: [{ text: (tlvl, stats, c) => <span>When a <b>Rain Sword</b> is shattered or when its duration expires, it regenerates the current character's HP based on 6% of Xingqiu's Max HP{DisplayPercent(6, stats, "finalHP")}.</span> }],
    },
    passive2: {
      name: "Blades Amidst Raindrops",
      img: passive2,
      document: [{ text: <span>Xingqiu gains a 20% <span className="text-hydro">Hydro DMG Bonus</span>.</span> }],
      stats: (c, a) => a >= 4 && {
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
        conditional: (tlvl, c, a) => c >= 2 && {
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
