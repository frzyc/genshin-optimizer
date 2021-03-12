import card from './Character_Venti_Card.jpg'
import thumb from './Character_Venti_Thumb.png'
import c1 from './Constellation_Splitting_Gales.png'
import c2 from './Constellation_Breeze_of_Reminiscence.png'
import c3 from './Constellation_Ode_to_Thousand_Winds.png'
import c4 from './Constellation_Hurricane_of_Freedom.png'
import c5 from './Constellation_Concerto_dal_Cielo.png'
import c6 from './Constellation_Storm_of_Defiance.png'
import normal from './Talent_Divine_Marksmanship.png'
import skill from './Talent_Skyward_Sonnet.png'
import burst from './Talent_Wind\'s_Grand_Ode.png'
import passive1 from './Talent_Embrace_of_Winds.png'
import passive2 from './Talent_Stormeye.png'
import passive3 from './Talent_Windrider.png'
import ElementalData from '../../ElementalData'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"

const char = {
  name: "Venti",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "bow",
  gender: "M",
  constellationName: "Carmen Dei",
  titles: ["Windborne Bard", "Tone-Deaf Bard"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Divine Marksmanship",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow. <small><i>Note: the 1st and 4th attack hits twice.</i></small></span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, favorable winds will accumulate on the arrowhead. A fully charged wind arrow will deal <span className="text-anemo">Anemo DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.hit[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: <span>Fully-Charged Aimed Shot DMG</span>,
          formulaText: (tlvl, stats) => <span>{data.charged.full[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.full,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats, true),
        },]
      }, (c) => c >= 1 && {
        text: <span><strong>Splitting Gales: </strong> Fires 2 additional split arrows per Aimed Shot</span>,
        fields: [{
          text: `Additional Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{(data.charged.hit[tlvl] * 0.33)?.toFixed(2)}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit_bonus,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Additional Full-Charged Aimed Shot DMG`,
          formulaText: (tlvl, stats) => <span>{(data.charged.full[tlvl] * 0.33)?.toFixed(2)}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.full_bonus,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats, true),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
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
      name: "Skyward Sonnet",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">
            O wind upon which all hymns and songs fly, bear these earth-walkers up into the sky!
          </p>
          <p className="mb-2">
            <strong>Press:</strong> Summons a Wind Domain at the opponent's location, dealing AoE Anemo DMG and launching opponents into the air.
          </p>
          <p className="mb-2">
            <strong>Hold:</strong> Summons an even larger Wind Domain with Venti as the epicenter, dealing AoE Anemo DMG and launching affected opponents into the air. After unleashing the Hold version of this ability, Venti rides the wind into the air.
            Opponents hit by Skyward Sonnet will fall to the ground slowly.
            Generate 3/4 elemental particles for press/hold when it hit at least 1 target.
          </p>
        </span>,
        fields: [{
          text: "Press DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.press[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.press,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Press CD",
          value: "6s",
        }, {
          text: "Hold DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.hold[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hold,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Hold CD",
          value: "15s",
        }, (c, a) => a >= 1 && {
          text: "Upcurrent Duration",
          value: "20s",
        }],
        conditional: (tlvl, c, a) => c >= 2 && [{
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Breeze of Reminiscence",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_enemyRes_: -12,
          },
        }, {
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Breeze of Reminiscence Launch",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_enemyRes_: -24,
            physical_enemyRes_: -12
          },
        }]
      }],
    },
    burst: {
      name: "Wind's Grand Ode",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">
            Fires off an arrow made of countless coalesced winds, creating a huge Stormeye that sucks in objects and opponents along its path, dealing 18 times <span className="text-anemo">Anemo DMG</span> in 8 seconds.
          </p>
          <p className="mb-2">
            <strong>Elemental Absorption:</strong> If the Stormeye comes into contact with <span className="text-hydro">Hydro</span>/<span className="text-pyro">Pyro</span>/<span className="text-cryo">Cryo</span>/<span className="text-electro">Electro</span> elements, it will deal 50% additional elemental DMG of that type. Elemental Absorption may only occur once per use.
          </p>
        </span>,
        fields: [{
          text: "DoT",
          formulaText: (tlvl, stats) => <span>{data.burst.hit[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "8s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, (c, a) => a >= 4 && {
          text: <span>Regen 15 Energy to Venti after effect ends.</span>,
        }, (c, a) => c >= 6 && {
          text: <span>Enemy <span className="text-anemo">Anemo RES</span> decrease</span>,
          value: "20%"
        }],
        conditional: (["hydro", "pyro", "cryo", "electro"]).map(eleKey => ({
          type: "character",
          conditionalKey: "Absorption",
          condition: <span><span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span> Absorption</span>,
          sourceKey: "venti",
          maxStack: 1,
          fields: [{
            text: "Dot",
            formulaText: (tlvl, stats) => <span>{(data.burst.hit[tlvl] / 2)?.toFixed(2)}% {Stat.printStat(`${eleKey}_burst_${stats.hitMode}`, stats)}</span>,
            formula: formula.burst[`${eleKey}_hit`],
            variant: eleKey
          }, (c, a) => a >= 4 && {
            text: <span>Regen 15 Energy to all <span className={`text-${eleKey}`}>{ElementalData[eleKey].name}</span> characters.</span>,
          }, (c, a) => c >= 6 && {
            text: <span>Enemy <span className={`text-${eleKey}`}>{ElementalData[eleKey].name} RES</span> decrease</span>,
            value: "20%"
          }]
        }))
      }],
    },
    passive1: {
      name: "Embrace of Winds",
      img: passive1,
      document: [{ text: <span>Holding <b>Skyward Sonnet</b> creates an upcurrent that lasts for 20s.</span> }],
    },
    passive2: {
      name: "Stormeye",
      img: passive2,
      document: [{ text: <span>Regenerates 15 Energy for Venti after the effects of <b>Wind's Grand Ode</b> end. If an Elemental Absorption occurred, this also restores 15 Energy to all characters of that corresponding element.</span> }],
    },
    passive3: {
      name: "Windrider",
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
      name: "Splitting Gales",
      img: c1,
      document: [{ text: <span>Fires 2 additional split arrows per Aimed Shot, each dealing 33% of the original arrow's DMG.</span> }],
    },
    constellation2: {
      name: "Breeze of Reminiscence",
      img: c2,
      document: [{ text: <span>Skyward Sonnet decreases enemy <span className="text-anemo">Anemo RES</span> by 12% for 10s. Enemies launched by Skyward Sonnet suffer an additional 12% <span className="text-anemo">Anemo RES</span> and <span className="text-physical">Physical RES</span> penalty when airborne.</span> }],
    },
    constellation3: {
      name: "Ode to Thousand Winds",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Wind's Grand Ode</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Hurricane of Freedom",
      img: c4,
      document: [{
        text: <span>When Venti picks up an Elemental Orb or Particle, he receives a 25% Anemo DMG Bonus for 10s.</span>,
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Hurricane of Freedom",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_dmg_: 25,
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    constellation5: {
      name: "Concerto dal Cielo",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Skyward Sonnet</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Storm of Defiance",
      img: c6,
      document: [{ text: <span>Targets who take DMG from Wind's Grand Ode have their <span className="text-anemo">Anemo RES</span> decreased by 20%. If an Elemental Absorption occurred, then their RES towards the corresponding Element is also decreased by 20%.</span> }],
    }
  },
};
export default char;
