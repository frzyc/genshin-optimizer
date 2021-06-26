import card from './Character_Keqing_Card.jpg'
import thumb from './Character_Keqing_Thumb.png'
import c1 from './Constellation_Thundering_Might.png'
import c2 from './Constellation_Keen_Extraction.png'
import c3 from './Constellation_Foreseen_Reformation.png'
import c4 from './Constellation_Attunement.png'
import c5 from './Constellation_Beckoning_Stars.png'
import c6 from './Constellation_Tenacious_Star.png'
import normal from './Talent_Yunlai_Swordsmanship.png'
import skill from './Talent_Stellar_Restoration.png'
import burst from './Talent_Starward_Sword.png'
import passive1 from './Talent_Thundering_Penance.png'
import passive2 from './Talent_Aristocratic_Dignity.png'
import passive3 from './Talent_Land\'s_Overseer.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
const conditionals: IConditionals = {
  a1: {
    canShow: stats => stats.ascension >= 4,
    name: <span>Recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present</span>,
    stats: { infusionSelf: "electro" },
    fields: [{
      text: "Duration",
      value: "5s"
    }]
  },
  a4: { // AristocraticDignity
    canShow: stats => stats.ascension >= 4,
    name: <span>Casting <b>Starward Sword</b></span>,
    stats: {
      critRate_: 15,
      enerRech_: 15,
    },
    fields: [{
      text: "Duration",
      value: "8s",
    }]
  },
  c4: { // Attunement
    canShow: stats => stats.constellation >= 4,
    name: "Trigger an Electro-related Elemental Reaction",
    stats: { atk_: 25 },
    fields: [{
      text: "Duration",
      value: "10s",
    }]
  },
  c6: { // Initating
    canShow: stats => stats.constellation >= 6,
    name: "Initiating Normal/Charged Attack, Skill or Burst",
    stats: { electro_dmg_: 6 },
    fields: [{
      text: "Duration",
      value: "8s",
    }]
  }
}
const char: ICharacterSheet = {
  name: "Keqing",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "electro",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Trulla Cementarii",
  titles: ["Driving Thunder", "Yuheng of the Liyue Qixing"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: "Yunlai Swordsmanship",
        img: normal,
        sections: [{
          text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + (i < 4 ? 1 : 0)}${i === 3 ? ".1" : i === 4 ? ".2" : ""}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
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
            value: `25`,
          }]
        }, {
          text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
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
        name: "Stellar Restoration",
        img: skill,
        sections: [{
          text: <span>
            <p className="mb-2">Hurls a Lightning Stiletto that annihilates her enemies like the swift thunder. When the Stiletto hits its target, it deals <span className="text-electro">Electro DMG</span> to enemies in a small AoE, and places a Stiletto Mark on the spot hit.</p>
            <p className="mb-2"><strong>Hold:</strong> Hold to adjust the direction in which the Stiletto shall be thrown. Stilettos thrown by the Hold attack mode can be suspended in mid-air, allowing Keqing to jump to them when using Stellar Restoration a second time.</p>
            <p className="mb-2"><strong>Lightning Stiletto:</strong> If Keqing uses Stellar Restoration again or uses a Charged Attack while its duration lasts, it will clear the Stiletto Mark and produce different effects:</p>
            <ul>
              <li>If she uses Stellar Restoration again, she will blink to the location of the Mark and unleash one slashing attack that deals <span className="text-electro">AoE Electro DMG</span>. When blinking to a Stiletto that was thrown from a Holding attack, Keqing can leap across obstructing terrain.</li>
              <li>
                <p className="mb-0">If Keqing uses a Charged Attack, she will ignite a series of thundering cuts at the Mark's location, dealing <span className="text-electro">AoE Electro DMG</span>.</p>
                <small><b>Thunderclap Slash</b> will hit twice.</small>
              </li>
            </ul>
          </span>,
          fields: [{
            text: "Lightning Stiletto DMG",
            formulaText: stats => <span>{data.skill.stilleto[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stilleto,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Slashing DMG",
            formulaText: stats => <span>{data.skill.slashing[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.slashing,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Thunderclap Slash DMG",
            formulaText: stats => <span>{data.skill.thunderclasp_slash[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.thunderclap_slashing,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "7.5s",
          }]
        }],
      },
      burst: {
        name: "Starward Sword",
        img: burst,
        sections: [{
          text: <span>
            <p className="mb-2">Keqing unleashes the power of lightning, dealing <span className="text-electro">Electro DMG</span> in an AoE.</p>
            <p className="mb-2">She then blends into the shadow of her blade, striking a series of thunderclap-blows to nearby enemies simultaneously that deal multiple instances of <span className="text-electro">Electro DMG</span>. The final attack deals massive <span className="text-electro">AoE Electro DMG</span>.</p>
            <small>The <b>consecutive slashes</b> hits 8 times.</small>
          </span>,
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.skill[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.skill,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Consecutive Slash DMG",
            formulaText: stats => <span>{data.burst.consec_slash[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.consec_slash,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Last Attack DMG",
            formulaText: stats => <span>{data.burst.last[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.last,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }],
          conditional: conditionals.a4
        }],
      },
      passive1: {
        name: "Thundering Penance",
        img: passive1,
        sections: [{
          text: <span>After recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present, Keqing's weapon gains an <span className="text-electro">Electro Infusion</span> for 5s.</span>,
          conditional: conditionals.a1
        }],
      },
      passive2: {
        name: "Aristocratic Dignity",
        img: passive2,
        sections: [{ text: <span>When casting <b>Starward Sword</b>, Keqing's CRIT Rate is increased by 15%, and her Energy Recharge is increased by 15%. This effect lasts for 8s.</span> }],
      },
      passive3: {
        name: "Land's Overseer",
        img: passive3,
        sections: [{ text: <span>When dispatched on an expedition in <b>Liyue</b>, time consumed is reduced by 25%.</span> }],
      },
      constellation1: {
        name: "Thundering Might",
        img: c1,
        sections: [{
          text: stats => <span>Recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present causes Keqing to deal 50% of her ATK as <span className="text-electro">AoE Electro DMG</span> at the start point and terminus of her Blink.</span>,
          fields: [{
            text: " Thundering Might DMG",
            formulaText: stats => <span>50% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation1.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }]
        }],
      },
      constellation2: {
        name: "Keen Extraction",
        img: c2,
        sections: [{ text: <span>When Keqing's Normal and Charged Attacks hit enemies affected by <span className="text-electro">Electro</span>, they have a 50% chance of producing an Elemental Particle. This effect can only occur once every 5s.</span> }],
      },
      constellation3: {
        name: "Foreseen Reformation",
        img: c3,
        sections: [{ text: <span>Increases the level of <b>Starward Sword</b> by 3. Maximum upgrade level is 15.</span> }],
        stats: { burstBoost: 3 }
      },
      constellation4: {
        name: "Attunement",
        img: c4,
        sections: [{ text: <span>For 10s after Keqing triggers an <span className="text-electro">Electro-related Elemental Reaction</span>, her ATK is increased by 25%.</span> }, {
          conditional: conditionals.c4
        }],
      },
      constellation5: {
        name: "Beckoning Stars",
        img: c5,
        sections: [{ text: <span>Increases the level of <b>Stellar Restoration</b> by 3. Maximum upgrade level is 15.</span> }],
        stats: { skillBoost: 3 }
      },
      constellation6: {
        name: "Tenacious Star",
        img: c6,
        sections: [{ text: <span>When initiating a Normal Attack, a Charged Attack, Elemental Skill or Elemental Burst, Keqing gains a 6% <span className="text-electro">Electro DMG Bonus</span> for 8s. Effects triggered by Normal Attacks, Charged Attacks, Elemental Skills, and Elemental Bursts are considered independent entities.</span> }, {
          conditional: conditionals.c6
        }],
      },
    },
  },
};
export default char;
