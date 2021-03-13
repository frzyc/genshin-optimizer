import card from "./Character_Qiqi_Card.jpg";
import thumb from "./Character_Qiqi_Thumb.png";
import c1 from "./Constellation_Ascetics_of_Frost.png";
import c2 from "./Constellation_Frozen_to_the_Bone.png";
import c3 from "./Constellation_Ascendant_Praise.png";
import c4 from "./Constellation_Divine_Suppression.png";
import c5 from "./Constellation_Crimson_Lotus_Bloom.png";
import c6 from "./Constellation_Rite_of_Resurrection.png";
import normal from "./Talent_Ancient_Sword_Art.png";
import skill from "./Talent_Adeptus_Art_-_Herald_of_Frost.png";
import burst from "./Talent_Adeptus_Art_-_Preserver_of_Fortune.png";
import passive1 from "./Talent_Life-Prolonging_Methods.png";
import passive2 from "./Talent_A_Glimpse_into_Arcanum.png";
import passive3 from "./Talent_Former_Life_Memories.png";
import Stat from "../../../Stat";
import formula, { data } from "./data";
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build";

const char = {
  name: "Qiqi",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "cryo",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Pristina Nola",
  titles: ["Pharmacist", "Icy Resurrection"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Ancient Sword Art",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive strikes. <small><i>Note: the 3rd and 4th attacks hit twice.</i></small></span>,
        fields: data.normal.hitArr.map((percentArr, i) => ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (i === 2 || i === 3) ?
            (tlvl, stats) => <span>( {percentArr[tlvl]}% + {percentArr[tlvl]}% ) {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span> :
            (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        })),
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes. <small><i>Note: The attack hits twice.</i></small></span>,
        fields: [{
          text: `Charged ATK DMG`,
          formulaText: (tlvl, stats) => <span>( {data.charged.hit[tlvl]}% + {data.charged.hit[tlvl]}% ) {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: "20",
        }],
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
      },
      ],
    },
    skill: {
      name: "Adeptus Art: Herald of Frost",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Using the Icevein Talisman, Qiqi brings forth the Herald of Frost, dealing <span className="text-cryo">Cryo DMG</span> to surrounding opponents.</p>
          <h6>Herald of Frost</h6>
          <ul className="mb-2">
            <li>On hit, Qiqi's Normal and Charged Attacks regenerate HP for your own party members and nearby teammates. Healing scales based on Qiqi's ATK. </li>
            <li>Periodically regenerates your active character's HP.</li>
            <li>Follows the character around, dealing <span className="text-cryo">Cryo DMG</span> to opponents in their path.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.hit[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Regeneration on Hit",
          formulaText: (tlvl, stats) => <span>( {data.skill.hitregen.atk[tlvl]}% {Stat.printStat("finalATK", stats)} + {data.skill.hitregen.base[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.hitregen,
          variant: "success",
        }, {
          text: "Continuous Regeneration",
          formulaText: (tlvl, stats) => <span>( {data.skill.continuousregen.atk[tlvl]}% {Stat.printStat("finalATK", stats)} + {data.skill.continuousregen.base[tlvl]} ) * {Stat.printStat("heal_multi", stats)}            </span>,
          formula: formula.skill.continuousregen,
          variant: "success",
        }, {
          text: "Herald of Frost DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.herald[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.herald,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "30s",
        }],
      }],
    },
    burst: {
      name: "Adeptus Art: Preserver of Fortune",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Qiqi releases the adeptus power sealed within her body, marking nearby opponents with a Fortune-Preserving Talisman that deals <span className="text-cryo">Cryo DMG</span>.</p>
          <h6>Fortune-Preserving Talisman:</h6>
          <p className="mb-0">When opponents affected by this Talisman take DMG, the character that dealt this DMG regenerates HP.</p>
        </span>,
        fields: [{
          text: "Burst DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Talisman Healing",
          formulaText: (tlvl, stats) => <span> ( {data.burst.healing.atk[tlvl]}% {Stat.printStat("finalATK", stats)} + {data.burst.healing.base[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.healing,
          variant: "success",
        }, {
          text: "Talisman Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 80,
        }],
      }],
    },
    passive1: {
      name: "Life-Prolonging Methods",
      img: passive1,
      document: [{
        text: <span>When a character under the effects of <b>Adeptus Art: Herald of Frost</b> triggers an Elemental Reaction, their Incoming Healing Bonus is increased by 20% for 8s.</span>,
        conditional: (tlvl, c, a) => a >= 1 && {
          type: "character",
          conditionalKey: "LifeProlongingMethods",
          condition: "Elemental Reaction Triggered",
          sourceKey: "qiqi",
          maxStack: 1,
          stats: { heal_: 20, },
          fields: [{
            text: "Duration",
            value: "8s",
          }],
        },
      }],
    },
    passive2: {
      name: "A Glimpse into Arcanum",
      img: passive2,
      document: [{
        text: <span>When Qiqi hits opponents with her <b>Normal and Charged Attacks</b>, she has a 50% chance to apply a Fortune-Preserving Talisman to them for 6s. This effect can only occur once every 30s.</span>,
        fields: [(con, a) => a >= 4 && {
          text: "Talisman Application Chance",
          value: "50%",
        }, (con, a) => a >= 4 && {
          text: "CD",
          value: "30s",
        }],
      },
      ],
    },
    passive3: {
      name: "Former Life Memories",
      img: passive3,
      document: [{ text: <span>Displays the location of nearby resources unique to Liyue on the mini-map.</span> }],
    },
    constellation1: {
      name: "Ascetics of Frost",
      img: c1,
      document: [{
        text: <span>When the <b>Herald of Frost</b> hits an opponent marked by a <b>Fortune-Preserving Talisman</b>, Qiqi regenerates 2 Energy.</span>,
        fields: [(con) => con >= 1 && {
          text: "Energy on Hit",
          value: 2,
        }],
      }],
    },
    constellation2: {
      name: "Frozen to the Bone",
      img: c2,
      document: [{
        text: <span>Qiqi's Normal and Charge Attack DMG against opponents affected by <span className="text-cryo">Cryo</span> is increased by 15%.</span>,
        conditional: (tlvl, c, a) => c >= 2 && {
          type: "character",
          conditionalKey: "EnemyCryo",
          condition: "Enemy Affected by Cryo",
          sourceKey: "qiqi",
          maxStack: 1,
          stats: {
            normal_dmg_: 15,
            charged_dmg_: 15,
          },
        },
      }],
    },
    constellation3: {
      name: "Ascendant Praise",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Adeptus Art: Preserver of Fortune</b> by 3.Maximum upgrade level is 15.</span>, }],
      talentBoost: { burst: 3 },
    },
    constellation4: {
      name: "Divine Suppression",
      img: c4,
      document: [{
        text: <span>Targets marked by the <b>Fortune-Preserving Talisman</b> have their ATK decreased by 20%.</span>,
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "DivineSuppression",
          condition: "Enemy marked by Talisman",
          sourceKey: "qiqi",
          maxStack: 1,
          fields: [{
            text: "Enemy ATK Decrease",//TODO: enemy atk decrease
            value: "20%"
          }],
        },
      }],
    },
    constellation5: {
      name: "Crimson Lotus Bloom",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Adeptus Art: Herald of Frost</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 },
    },
    constellation6: {
      name: "Rite of Resurrection",
      img: c6,
      document: [{
        text: <span>
          <p className="mb-2">Using <b>Adeptus Art: Preserver of Fortune</b> revives all fallen party members nearby and regenerates 50% of their HP.</p>
          <ul className="mb-0"><li>This effect can only occur once every 15 mins.</li></ul>
        </span>,
        fields: [(con) => con >= 6 && {
          text: "Revival HP Regeneration",
          value: `50% of Max HP`,
        }, (con) => con >= 6 && {
          text: "Cooldown",
          value: `15m`,
        },
        ],
      },
      ],
    },
  },
};
export default char;
