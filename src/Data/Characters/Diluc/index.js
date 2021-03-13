import card from './Character_Diluc_Card.jpg'
import thumb from './Character_Diluc_Thumb.png'
import c1 from './Constellation_Conviction.png'
import c2 from './Constellation_Searing_Ember.png'
import c3 from './Constellation_Fire_and_Steel.png'
import c4 from './Constellation_Flowing_Flame.png'
import c5 from './Constellation_Phoenix,_Harbinger_of_Dawn.png'
import c6 from './Constellation_Flaming_Sword,_Nemesis_of_Dark.png'
import normal from './Talent_Tempered_Sword.png'
import skill from './Talent_Searing_Onslaught.png'
import burst from './Talent_Dawn.png'
import passive1 from './Talent_Relentless.png'
import passive2 from './Talent_Blessing_of_Phoenix.png'
import passive3 from './Talent_Tradition_of_the_Dawn_Knight.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Diluc",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Noctua",
  titles: ["The Dark Side of Dawn", "Darknight Hero", "The Uncrowned King of Mondstadt"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Tempered Sword",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 consecutive strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats)
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous slashes. At the end of the sequence, perform a more powerful slash.</span>,
        fields: [{
          text: `Spinning DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.spinning[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.spinning,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats)
        }, {
          text: `Spinning Final DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.final[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.final,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats)
        }, (c, a) => ({
          text: `Stamina Cost`,
          value: "40/s" + (a >= 1 ? " - 20/s" : ""),
        }), (c, a) => ({
          text: `Max Duration`,
          value: "5s" + (a >= 1 ? " + 3s" : ""),
        })]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
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
      name: "Searing Onslaught",
      img: skill,
      document: [{
        text: <span>
          Performs a forward slash that deals <span className="text-pyro">Pyro DMG</span>.
          This skill can be used 3 times consecutively. Enters CD if not cast again within a short period (5s).
        </span>,
        fields: [
          ...[["hit1", "1-Hit DMG"], ["hit2", "2-Hit DMG"], ["hit3", "3-Hit DMG"]].map(([key, text]) => ({
            text,
            formulaText: (tlvl, stats) => <span>{formula.skill[key][tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill[key],
            variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
          })),
          (c) => {
            if (c < 4) return null
            return {
              text: "2-Hit DMG(Boosted)",
              formulaText: (tlvl, stats) => <span>{data.skill.hit2[tlvl]}% + 40% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.hit2b,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats)
            }
          }, (c) => {
            if (c < 4) return null
            return {
              text: "3-Hit DMG(Boosted)",
              formulaText: (tlvl, stats) => <span>{data.skill.hit3[tlvl]}% + 40% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.hit3b,
              variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats)
            }
          }, {
            text: "CD",
            value: "12s",
          }]
      }, {
        conditional: (tlvl, c, a) => c >= 6 && {
          type: "character",
          conditionalKey: "FlamingSwordNemesisOfDark",
          condition: "Flaming Sword, Nemesis of Dark",
          sourceKey: "diluc",
          maxStack: 1,
          stats: {
            normal_dmg_: 30,
            atkSPD_: 30,
          },
          fields: [{
            text: "Next 2 Normal Attack within",
            value: "6s",
          }]
        }
      }],
    },
    burst: {
      name: "Dawn",
      img: burst,
      document: [{
        text: <span>
          Releases intense flames to knock nearby opponents back, dealing <span className="text-pyro">Pyro DMG</span>. The flames then converge into the weapon, summoning a Phoenix that flies forward and deals massive <span className="text-pyro">Pyro DMG</span> to all opponents in its path. The Phoenix explodes upon reaching its destination, causing a large amount of <span className="text-pyro">AoE Pyro DMG</span>.
          The searing flames that run down his blade cause it to be infused with <span className="text-pyro">Pyro</span>.
        </span>,
        fields: [
          ...[["slashing", "Slashing DMG"], ["dot", "DoT"], ["explosion", "Explosion DMG"]].map(([key, text]) => ({
            text,
            formulaText: (tlvl, stats) => <span>{formula.burst[key][tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.burst[key],
            variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
          })),
          {
            text: "CD",
            value: "12s",
          }, (c, a) => ({
            text: "Infusion Duration",
            value: "8s" + (a > 4 ? " + 4s" : ""),
          }), {
            text: "Energy Cost",
            value: 40,
          }]
      }, {
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "BlessingOfPhoenix",
          condition: "Blessing of Phoenix",
          sourceKey: "diluc",
          maxStack: 1,
          stats: {
            pyro_dmg_: 20,
          },
        }
      }],
    },
    passive1: {
      name: "Relentless",
      img: passive1,
      document: [{ text: <span>Diluc's <b>Charged Attack</b> Stamina Cost is decreased by 50%, and its duration is increased by 3s.</span> }],
    },
    passive2: {
      name: "Blessing of Phoenix",
      img: passive2,
      document: [{ text: <span>The <span className="text-pyro">Pyro Enchantment</span> provided by <b>Dawn</b> lasts for 4s longer. Additionally. Diluc gains 20% <span className="text-pyro">Pyro DMG Bonus</span> during the duration of this effect.</span> }],
    },
    passive3: {
      name: "Tradition of the Dawn Knight",
      img: passive3,
      document: [{ text: <span>Refunds 15% of the ores used when crafting Claymore-type weapons.</span> }],
    },
    constellation1: {
      name: "Conviction",
      img: c1,
      document: [{ text: <span>	Diluc deals 15% more DMG to enemies whose HP is above 50%.</span> }, {
        conditional: (tlvl, c, a) => c >= 1 && {
          type: "character",
          conditionalKey: "Enemy50",
          condition: "Enemies with >50% HP",
          sourceKey: "diluc",
          maxStack: 1,
          stats: {
            dmg_: 15,
          },
        }
      }],
    },
    constellation2: {
      name: "Searing Ember",
      img: c2,
      document: [{
        text: <span>
          When Diluc takes DMG, his ATK increases by 10%, and his ATK SPD increases by 5%. Last for 10s.
          This effect can stack up to 3 times and can only occur once every 1.5s.
      </span>
      }, {
        conditional: (tlvl, c, a) => c >= 2 && {
          type: "character",
          conditionalKey: "TakeDMG",
          condition: "Take DMG",
          sourceKey: "diluc",
          maxStack: 3,
          stats: {
            atk_: 10,
            atkSPD_: 5
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    constellation3: {
      name: "Fire and Steel",
      img: c3,
      document: [{ text: <span>Increases <b>Searing Onslaught</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Flowing Flame",
      img: c4,
      document: [{
        text: <span>Casting <b>Searing Onslaught</b> in sequence greatly increases damage dealt.
        Within 2s of using Searing Onslaught, casting the next Searing Onslaught in the combo deals 40% additional DMG. This effect lasts for the next 2s.</span>
      }],
    },
    constellation5: {
      name: "Phoenix, Harbinger of Dawn",
      img: c5,
      document: [{ text: <span>Increases <b>Dawn</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Flaming Sword, Nemesis of Dark",
      img: c6,
      document: [{
        text: <span>
          After casting <b>Searing Onslaught</b>, the next 2 Normal Attacks within the next 6s will have their DMG and ATK SPD increased by 30%.
          Additionally, <b>Searing Onslaught</b> will not interrupt the Normal Attack combo.
        </span>
      }],
    }
  },
};
export default char;
