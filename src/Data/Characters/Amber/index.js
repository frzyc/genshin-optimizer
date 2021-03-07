import card from './Character_Amber_Card.jpg'
import thumb from './Character_Amber_Thumb.png'
import c1 from './Constellation_One_Arrow_to_Rule_Them_All.png'
import c2 from './Constellation_Bunny_Triggered.png'
import c3 from './Constellation_It_Burns.png'
import c4 from './Constellation_It\'s_Not_Just_Any_Doll....png'
import c5 from './Constellation_It\'s_Baron_Bunny.png'
import c6 from './Constellation_Wildfire.png'
import normal from './Talent_Sharpshooter.png'
import skill from './Talent_Explosive_Puppet.png'
import burst from './Talent_Fiery_Rain.png'
import passive1 from './Talent_Every_Arrow_Finds_Its_Target.png'
import passive2 from './Talent_Precise_Shot.png'
import passive3 from './Talent_Gliding_Champion.png'
import Character from '../../../Character/Character'
import Stat from '../../../Stat'

//AUTO
const hitPercent = [
  [36.12, 39.06, 42, 46.2, 49.14, 52.5, 57.12, 61.74, 66.36, 71.4, 76.44, 81.48, 86.52, 91.56, 96.6],
  [36.12, 39.06, 42, 46.2, 49.14, 52.5, 57.12, 61.74, 66.36, 71.4, 76.44, 81.48, 86.52, 91.56, 96.6],
  [46.44, 50.22, 54, 59.4, 63.18, 67.5, 73.44, 79.38, 85.32, 91.8, 98.28, 104.76, 111.24, 117.72, 124.2],
  [47.3, 51.15, 55, 60.5, 64.35, 68.75, 74.8, 80.85, 86.9, 93.5, 100.1, 106.7, 113.3, 119.9, 126.5],
  [59.34, 64.17, 69, 75.9, 80.73, 86.25, 93.84, 101.43, 109.02, 117.3, 125.58, 133.86, 142.14, 150.42, 158.7],
]

const aimedShot = [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3]
const fullAimedShot = [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const explosivePuppet = {
  hp: [41.36, 44.46, 47.56, 51.7, 54.8, 57.9, 62.04, 66.18, 70.31, 74.45, 78.58, 82.72, 87.89, 93.06, 98.23],
  dmg: [123.2, 132.44, 141.68, 154, 163.24, 172.48, 184.8, 197.12, 209.44, 221.76, 234.08, 246.4, 261.8, 277.2, 292.6],
}
const fieryRain = {
  dmg_perwave: [28.08, 30.19, 32.29, 35.1, 37.21, 39.31, 42.12, 44.93, 47.74, 50.54, 53.35, 56.16, 59.67, 63.18, 66.69],
  total_dmg: [505.44, 543.35, 581.26, 631.8, 669.71, 707.62, 758.16, 808.7, 859.25, 909.79, 960.34, 1010.88, 1074.06, 1137.24, 1200.42],
}

let char = {
  name: "Amber",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Lepus",
  titles: ["Outrider", "Champion Glider"],
  baseStat: {
    characterHP: [793, 2038, 2630, 3940, 4361, 5016, 5578, 6233, 6654, 7309, 7730, 8385, 8806, 9461],
    characterATK: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [50, 129, 167, 250, 277, 318, 354, 396, 423, 464, 491, 532, 559, 601]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
  },
  talent: {
    auto: {
      name: "Sharpshooter",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, flames will accumulate on the arrowhead. A fully charged flaming arrow will deal <span className="text-pyro">Pyro DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{aimedShot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("charged", c)]: aimedShot[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: <span>Fully-Charged Aimed Shot DMG</span>,
          basicVal: (tlvl, stats, c) => <span>{fullAimedShot[tlvl]}% {Stat.getStatName(Character.getTalentStatKey("charged", c, true))}</span>,
          finalVal: (tlvl, stats, c) => (fullAimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c, true)]: fullAimedShot[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling an striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
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
      name: "Explosive Puppet",
      img: skill,
      document: [{
        text: <span>
          The ever-reliable Baron Bunny takes the stage.
        <h6>Baron Bunny:</h6>
          <ul>
            <li>Continuously taunts the enemy, drawing their fire.</li>
            <li>Baron Bunny's HP scales with Amber's Max HP.</li>
            <li>When destroyed or when its timer expires, Baron Bunny explodes, dealing AoE <span className="text-pyro">Pyro DMG</span>.</li>
            <li>Generate 4 elemental particles when it hit at least 1 target.</li>
          </ul>
          <div><strong>Hold:</strong> Adjusts the throwing direction of Baron Bunny. The longer the button is held, the further the throw.</div>
        </span>,
        fields: [{
          text: "Inherited HP",
          basicVal: (tlvl, stats, c) => <span>{explosivePuppet.hp[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
          finalVal: (tlvl, stats, c) => (explosivePuppet.hp[tlvl] / 100) * stats.finalHP,
          formula: (tlvl) => ({ finalHP: explosivePuppet.hp[tlvl] / 100 }),
        }, {
          text: "Explosion DMG",
          basicVal: (tlvl, stats, c) => <span>{explosivePuppet.dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (explosivePuppet.dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: explosivePuppet.dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (c) => c >= 2 ? {
          text: "Manual Detonation DMG",
          basicVal: (tlvl, stats, c) => <span>{explosivePuppet.dmg[tlvl]}% + 200% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => ((explosivePuppet.dmg[tlvl] + 200) / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: (explosivePuppet.dmg[tlvl] + 200) / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        } : null, (c) => c >= 4 ? {
          text: "Charges",
          value: 2,
        } : null, (c) => ({
          text: "CD",
          value: "15s" + (c >= 4 ? " -20%" : ""),
        })]
      }],
    },
    burst: {
      name: "Fiery Rain",
      img: burst,
      document: [{
        text: <span>
          Fires off a shower of arrows, dealing continuous <span className="text-pyro">AoE Pyro DMG</span>.
      </span>,
        fields: [(c, a) => ({
          text: "DMG Per Wave",
          basicVal: (tlvl, stats, c) => <span>{fieryRain.dmg_perwave[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (fieryRain.dmg_perwave[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: fieryRain.dmg_perwave[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }), (c, a) => ({
          text: "Rain DMG",
          basicVal: (tlvl, stats, c) => <span>{fieryRain.total_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (fieryRain.total_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: fieryRain.total_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }), (c, a) => {
          if (a < 1) return null
          return {
            text: "CRIT Rate Bonus",
            value: "10%"
          }
        }, (c, a) => {
          if (a < 1) return null
          return {
            text: "AoE Range Bonus",
            value: "30%"
          }
        }, {
          text: "Duration",
          value: "2s",
        }, {
          text: "CD",
          value: "12s",
        }, {
          text: "Energy Cost",
          value: 40,
        },]
      }, {
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "WildFire",
          condition: "Wildfire",
          sourceKey: "amber",
          maxStack: 1,
          stats: {
            atk_: 15,
            moveSPD_: 15
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
      stats: (c, a) => a >= 1 ? ({
        burst_critRate_: 10
      }) : null,
    },
    passive1: {
      name: "Every Arrow Finds Its Target",
      img: passive1,
      document: [{ text: <span>Increases the CRIT Rate of <b>Fiery Rain</b> by 10% and widens its AoE by 30%.</span> }],
    },
    passive2: {
      name: "Precise Shot",
      img: passive2,
      document: [{ text: <span>Aimed Shot hits on weak spots increase ATK by 15% for 10s.</span> }, {
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "PreciseShot",
          condition: "Precise Shot",
          sourceKey: "amber",
          maxStack: 1,
          stats: {
            atk_: 15,
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    passive3: {
      name: "Gliding Champion",
      img: passive3,
      document: [{
        text: <span>
          Decreases gliding Stamina consumption for your own party members by 20%.
          Not stackable with Passive Talents that provide the exact same effects.
      </span>
      }],
      stats: {
        staminaGlidingDec_: 20,
      }
    },
    constellation1: {
      name: "One Arrow to Rule Them All",
      img: c1,
      document: [{
        text: <span>
          Fires 2 arrows per <b>Aimed Shot</b>. The second arrow deals 20% of the first arrow's DMG.
        The second arrow is fired 10 degrees vertically below actual aiming, has separate critical, and also makes the primary shot travel further before it starts dropping down.
      </span>
      }],
    },
    constellation2: {
      name: "Bunny Triggered",
      img: c2,
      document: [{
        text: <span>
          Baron Bunny, new and improved! Hitting <b>Baron Bunny</b>'s foot with a fully-charged <b>Aimed Shot</b> manually detonates it.
          Explosion via manual detonation deals 200% additional DMG.
        </span>
      }]
    },
    constellation3: {
      name: "It Burns!",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Fiery Rain</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "It's Not Just Any Doll...",
      img: c4,
      document: [{ text: <span>Decreases <b>Explosive Puppet</b>'s CD by 20%. Adds 1 additional charge.</span> }]
    },
    constellation5: {
      name: "It's Baron Bunny!",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Explosive Puppet</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Wildfire",
      img: c6,
      document: [{ text: <span><b>Fiery Rain</b> increases the entire party's Movement SPD by 15% and ATK by 15% for 10s.</span> }]
      //TODO party buff
    },
  },
};

export default char;
