import card from './Character_Zhongli_Card.png'
import thumb from './Character_Zhongli_Thumb.png'
import c1 from './Constellation_Rock,_the_Backbone_of_Earth.png'
import c2 from './Constellation_Stone,_the_Cradle_of_Jade.png'
import c3 from './Constellation_Jade,_Shimmering_through_Darkness.png'
import c4 from './Constellation_Topaz,_Unbreakable_and_Fearless.png'
import c5 from './Constellation_Lazuli,_Herald_of_the_Order.png'
import c6 from './Constellation_Chrysos,_Bounty_of_Dominator.png'
import normal from './Talent_Rain_of_Stone.png'
import skill from './Talent_Dominus_Lapidis.png'
import burst from './Talent_Planet_Befall.png'
import passive1 from './Talent_Resonant_Waves.png'
import passive2 from './Talent_Dominance_of_Earth.png'
import passive3 from './Talent_Arcanum_of_Crystal.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import ElementalData from '../../ElementalData'

const char = {
  name: "Zhongli",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "polearm",
  gender: "M",
  constellationName: "Lapis Dei",
  titles: ["Vago Mundo"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Rain of Stone",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 6 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
          (con, a) => a < 4 ?
            {
              text: `${i + 1}-Hit DMG`,
              formulaText: (tlvl, stats) => <span>{i === 4 ? "4 × " : ""}{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
            } : {
              text: `${i + 1}-Hit DMG`,
              formulaText: (tlvl, stats) => <span>{i === 4 ? "4 × " : ""}( {percentArr[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("normal", stats) + "_multi", stats)}</span>,
              formula: formula.normal[`${i}HP`],
              variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
            })
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to lunge forward, causing stone spears to fall along his path.</span>,
        fields: [
          (con, a) => a < 4 ?
            {
              text: `Charged Attack DMG`,
              formulaText: (tlvl, stats) => <span>{data.charged.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.dmg,
              variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
            } : {
              text: `Charged Attack DMG`,
              formulaText: (tlvl, stats) => <span>( {data.charged.dmg[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.dmgHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
            },
          {
            text: `Stamina Cost`,
            value: 25,
          }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [
          (con, a) => a < 4 ?
            {
              text: `Plunge DMG`,
              formulaText: (tlvl, stats) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
              formula: formula.plunging.dmg,
              variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
            } : {
              text: `Plunge DMG`,
              formulaText: (tlvl, stats) => <span>( {data.plunging.dmg[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
              formula: formula.charged.dmgHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
            },
          (con, a) => a < 4 ?
            {
              text: `Low Plunge DMG`,
              formulaText: (tlvl, stats) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
              formula: formula.plunging.low,
              variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
            } : {
              text: `Low Plunge DMG`,
              formulaText: (tlvl, stats) => <span>( {data.plunging.low[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
              formula: formula.plunging.lowHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
            },
          (con, a) => a < 4 ?
            {
              text: `High Plunge DMG`,
              formulaText: (tlvl, stats) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
              formula: formula.plunging.high,
              variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
            } : {
              text: `High Plunge DMG`,
              formulaText: (tlvl, stats) => <span>( {data.plunging.high[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
              formula: formula.plunging.highHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
            }]
      }],
    },
    skill: {
      name: "Dominus Lapidis",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Every mountain, rock, and inch of land is filled with the power of Geo, but those who can wield such powers freely are few and far between.</p>
          <p className="mb-2"><b>Press</b>: Commands the omnipresent power of the earth to solidify into a Stone Stele, standing 30 seconds, dealing <span className="text-geo">AoE Geo DMG</span> at the creation.</p>
          <p className="mb-2"><b>Hold</b>: Causes nearby Geo energy to explode, causing the following effects:</p>
          <ul className="mb-2">
            <li>If their maximum number hasn't been reached, creates a Stone Stele.</li>
            <li>Creates a shield of jade. The shield's DMG Absorption scales based on Zhongli's Max HP. Possesses 150% DMG Absorption against all Elemental and Physical DMG.</li>
            <li>Deals <span className="text-geo">AoE Geo DMG</span>.</li>
            <li>If there are nearby targets with the <span className="text-geo">Geo element</span>, it will drain a large amount of <span className="text-geo">Geo element</span> from a maximum of 2 such targets. This effect does not cause DMG.</li>
          </ul>
          <p className="mb-0"><b>Stone Stele</b>: When created, deals <span className="text-geo">AoE Geo DMG</span>. Additionally, every 2 seconds, it will resonate with other nearby <span className="text-geo">Geo Constructs</span>, dealing <span className="text-geo">Geo DMG</span> to surrounding opponents. Stele creation and Resonance generate <b>0.5</b> elemental particles.</p>
          <p className="mb-0">The Stone Stele is considered a <span className="text-geo">Geo Construct</span> that can both be climbed and used to block attacks.</p>
          <p className="mb-2">Only one Stele created by Zhongli himself may initially exist at any one time.</p>
          <p className="mb-0"><b>Jade Shield</b>: Possesses 150% DMG Absorption against all Elemental and Physical DMG.</p>
          <p className="mb-2">Characters protected by the Jade Shield will decrease the Elemental RES and Physical RES of opponents in a small AoE by 20%. This effect cannot be stacked.</p>
        </span>,
        fields: [
          (con, a) => a < 4 ?
            {
              text: "Stone Stele DMG",
              formulaText: (tlvl, stats) => <span>{data.skill.steeleDMG[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.steeleDMG,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            } : {
              text: "Stone Stele DMG",
              formulaText: (tlvl, stats) => <span>( {data.skill.steeleDMG[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
              formula: formula.skill.steeleDMGHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            },
          (con, a) => a < 4 ?
            {
              text: "Resonance DMG",
              formulaText: (tlvl, stats) => <span>{data.skill.resonanceDMG[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.resonanceDMG,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            } : {
              text: "Resonance DMG",
              formulaText: (tlvl, stats) => <span>( {data.skill.resonanceDMG[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
              formula: formula.skill.resonanceDMGHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            },
          (con, a) => ({
            text: "Maximum Stele number",
            value: con >= 1 ? 2 : 1,
          }), {
            text: "Press CD",
            value: "4s",
          },
          (con, a) => a < 4 ?
            {
              text: "Hold DMG",
              formulaText: (tlvl, stats) => <span>{data.skill.holdDMG[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.holdDMG,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            } : {
              text: "Hold DMG",
              formulaText: (tlvl, stats) => <span>( {data.skill.holdDMG[tlvl]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
              formula: formula.skill.holdDMGHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
            },
          {
            text: "Shield Absorption",
            formulaText: (tlvl, stats) => <span>{data.skill.shieldBase[tlvl]} + {data.skill.shieldMaxHP[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
            formula: formula.skill.shield,
          }, {
            text: "Shield Duration",
            value: "20s",
          }, {
            text: "Hold CD",
            value: "12s",
          }],
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "JadeShield",
          condition: "Enemies near Jade Shield",
          sourceKey: "zhongli",
          maxStack: 1,
          stats: Object.fromEntries(Object.keys(ElementalData).map(k => [`${k}_enemyRes_`, -20])),//TODO: party buff
        }
      }],
    },
    burst: {
      name: "Planet Befall",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Brings a falling meteor down to earth, dealing massive <span className="text-geo">Geo DMG</span> to opponents caught in its AoE and applying the <span className="text-geo">Petrification</span> status to them.</p>
          <p className="mb-0"><b>Petrification</b>: Opponents affected by the <span className="text-geo">Petrification</span> status cannot move.</p>
        </span>,
        fields: [
          (con, a) => a < 4 ?
            {
              text: "Skill DMG",
              formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
              formula: formula.burst.dmg,
              variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
            } : {
              text: "Skill DMG",
              formulaText: (tlvl, stats) => <span>( {data.burst.dmg[tlvl]}% {Stat.printStat("finalATK", stats)} + 33% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
              formula: formula.burst.dmgHP,
              variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
            },
          (con) => con >= 4 && {
            text: "AoE Increase",
            value: "20%",
          },
          (con) => ({
            text: "Petrification Duration",
            value: (tlvl, stats) => data.burst.petriDur[tlvl] + "s" + (con >= 4 ? " +2s" : ""),
          }), {
            text: "CD",
            value: "12s",
          }, {
            text: "Energy Cost",
            value: 40,
          }]
      }],
    },
    passive1: {
      name: "Resonant Waves",
      img: passive1,
      document: [{
        text: <span>
          <p className="mb-2">When the Jade Shield takes DMG, it will Fortify:</p>
          <ul className="mb-2">
            <li>Fortified characters have 5% increased Shield Strength.</li>
            <li>Can stack up to 5 times, and lasts until the Jade Shield disappears.</li>
          </ul>
        </span>,
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "ResonantWaves",
          condition: "Resonant Waves",
          sourceKey: "zhongli",
          maxStack: 5,
          stats: {
            powShield_: 5
          },
        }
      }],
    },
    passive2: {
      name: "Dominance of Earth",
      img: passive2,
      document: [{
        text: <span>
          <p className="mb-2">Zhongli deals bonus DMG based on his Max HP:</p>
          <ul className="mb-2">
            <li><b>Normal Attack</b>, <b>Charged Attack</b>, and <b>Plunging Attack</b> DMG is increased by 1.39% of Max HP.</li>
            <li><b>Dominus Lapidis</b> Stone Stele, resonance, and hold DMG is increased by 1.9% of Max HP.</li>
            <li><b>Planet Befall</b> deals additional DMG equal to 33% of Zhongli's Max HP.</li>
          </ul>
        </span>
      }],
    },
    passive3: {
      name: "Arcanum of Crystal",
      img: passive3,
      document: [{ text: <span>Refunds 15% of the ores used when crafting Polearm-type weapons.</span> }],
    },
    constellation1: {
      name: "Rock, the Backbone of Earth",
      img: c1,
      document: [{ text: <span>Increases the maximum number of Stone Steles created by <b>Dominus Lapidis</b> that may exist simultaneously to 2.</span> }],
    },
    constellation2: {
      name: "Stone, the Cradle of Jade",
      img: c2,
      document: [{ text: <span><b>Planet Befall</b> grants nearby characters on the field a Jade Shield when it descends.</span> }],
    },
    constellation3: {
      name: "Jade, Shimmering through Darkness",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Dominus Lapidis</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Topaz, Unbreakable and Fearless",
      img: c4,
      document: [{ text: <span>Increases <b>Planet Befall</b>'s AoE by 20% and increases the duration of <b>Planet Befall</b>'s Petrification effect by 2s.</span> }],
    },
    constellation5: {
      name: "Lazuli, Herald of the Order",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Planet Befall</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Chrysos, Bounty of Dominator",
      img: c6,
      document: [{
        text: <span>When the <b>Jade Shield</b> takes DMG, 40% of that incoming DMG is converted to HP for the current character. A single instance of regeneration cannot exceed 8% of that character's Max HP.</span>,
        fields: [(con) => con >= 6 && {
          text: "Maximum Health Regen",
          value: (tlvl, stats) => stats.finalHP * 0.08,
          variant: "success"
        },]
      }],
    }
  },
};
export default char;
