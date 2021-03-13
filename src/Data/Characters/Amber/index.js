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
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Amber",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Lepus",
  titles: ["Outrider", "Champion Glider"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Sharpshooter",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, flames will accumulate on the arrowhead. A fully charged flaming arrow will deal <span className="text-pyro">Pyro DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.aimedShot[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.aimShot,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: <span>Fully-Charged Aimed Shot DMG</span>,
          formulaText: (tlvl, stats) => <span>{data.charged.fullAimedShot[tlvl]}% {Stat.getStatName(getTalentStatKey("charged", stats, true))}</span>,
          formula: formula.charged.fullAimedShot,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats, true),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling an striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }]
      }],
    },
    skill: {
      name: "Explosive Puppet",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">The ever-reliable Baron Bunny takes the stage.</p>
          <h6>Baron Bunny:</h6>
          <ul className="mb-2">
            <li>Continuously taunts the enemy, drawing their fire.</li>
            <li>Baron Bunny's HP scales with Amber's Max HP.</li>
            <li>When destroyed or when its timer expires, Baron Bunny explodes, dealing AoE <span className="text-pyro">Pyro DMG</span>.</li>
            <li>Generate 4 elemental particles when it hit at least 1 target.</li>
          </ul>
          <p className="mb-0"><strong>Hold:</strong> Adjusts the throwing direction of Baron Bunny. The longer the button is held, the further the throw.</p>
        </span>,
        fields: [{
          text: "Inherited HP",
          formulaText: (tlvl, stats) => <span>{data.skill.hp[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
          formula: formula.skill.hp,
        }, {
          text: "Explosion DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (con) => con >= 2 && {
          text: "Manual Detonation DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% + 200% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.detonationDMG,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (con) => con >= 4 && {
          text: "Charges",
          value: 2,
        }, (con) => ({
          text: "CD",
          value: "15s" + (con >= 4 ? " -20%" : ""),
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
        fields: [{
          text: "DMG Per Wave",
          formulaText: (tlvl, stats) => <span>{data.burst.dmgPerWave[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmgPerWave,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Rain DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.totDMG[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.totDMG,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, (c, a) => {
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
