import card from './Character_Hu_Tao_Card.jpg'
import thumb from './Character_Hu_Tao_Thumb.png'
import c1 from './Constellation_Crimson_Bouquet.png'
import c2 from './Constellation_Ominous_Rainfall.png'
import c3 from './Constellation_Lingering_Carmine.png'
import c4 from './Constellation_Garden_of_Eternal_Rest.png'
import c5 from './Constellation_Floral_Incense.png'
import c6 from './Constellation_Butterfly\'s_Embrace.png'
import normal from './Talent_Secret_Spear_of_Wangsheng.png'
import skill from './Talent_Guide_to_Afterlife.png'
import burst from './Talent_Spirit_Soother.png'
import passive1 from './Talent_Flutter_By.png'
import passive2 from './Talent_Sanguine_Rouge.png'
import passive3 from './Talent_The_More_the_Merrier.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Hu Tao",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: "Papilio Charontis",
  titles: ["Fragrance in Thaw", "77th-Generation Director of the Wangsheng Funeral Parlor", "Director Hu", "Liyue Harbor's \"Versemonger of the Darkest Alleys\""],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Secret Spear of Wangsheng",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 rapid strikes. <small><i>Note: the 5th attack hits twice.</i></small></span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + (i < 5 ? 1 : 0)}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to lunge forward, dealing damage to enemies along the way.</span>,
        fields: [{
          text: `Charged Attack`,
          formulaText: (tlvl, stats) => <span>{data.charged.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 25,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
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
      name: "Guide to Afterlife",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Hu Tao consumes a part of her HP, knocking nearby enemies back and entering the <b>Paramita Papilio State</b>.</p>
          <h6>Paramita Papilio State:</h6>
          <ul className="mb-1">
            <li>Increases Hu Tao's ATK based on her Max HP at the time of entering this state. ATK Bonus gained this way cannot exceed 400% of Hu Tao's Base ATK. Hu Tao's attack DMG is converted to <span className="text-pyro">Pyro DMG</span>, which cannot be overridden by any other elemental infusion.</li>
            <li>Increases Hu Tao's resistance to interruption.</li>
            <li>Paramita Papilio ends when its duration is over, or when Hu Tao has left the battlefield or fallen.</li>
            <li>In the Paramita Papilio state, Hu Tao's Charged Attacks apply the <b>Blood Blossom</b> effect to enemies it hits.</li>
          </ul>
          <h6>Blood Blossom Effect:</h6>
          <ul className="mb-1">
            <li>Enemies affected by <b>Blood Blossom</b> will take <span className="text-pyro">Pyro DMG</span> every 4s.</li>
            <li>This DMG is considered Elemental Skill DMG.</li>
            <li>Each enemy can be affected by only one Blood Blossom effect at a time, and its duration may only be refreshed by Hu Tao herself.</li>
          </ul>
          <small>Note: The 400% base ATK limit is not currently being applied. Optimizers beware.</small>
        </span>,
        fields: [{
          text: "Activation Cost",
          value: "30% Current HP",
        }, {
          // TODO Add 400% baseATK CAP text
          text: "ATK Increase",
          formulaText: (tlvl, stats) => <span>{data.skill.atk_inc[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
          formula: formula.skill.atk_inc,
        }, (con) => con < 2 && {
          text: "Blood Blossom DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (con) => con >= 2 && {
          text: "Blood Blossom DMG (C2)",
          formulaText: (tlvl, stats) => <span>( {data.skill.dmg[tlvl]}% {Stat.printStat("finalATK", stats)} + 10% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
          formula: formula.skill.dmgC2,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Blood Blossom Duration",
          value: "8s",
        }, {
          text: "Duration",
          value: "9s",
        }, {
          text: "CD",
          value: "16s",
        },],
        conditional: (tlvl, c, a) => ({
          type: "character",
          conditionalKey: "GuideToAfterlife",
          condition: "Guide to Afterlife Voyage",
          sourceKey: "hutao",
          maxStack: 1,
          stats: {
            modifiers: { finalATK: { finalHP: data.skill.atk_inc[tlvl] / 100, } },
          },
        })
      }],
    },
    burst: {
      name: "Spirit Soother",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Hu Tao commands a blazing spirit to deal Pyro DMG in a large AoE. Upon striking the enemy, regenerates a percentage of Hu Tao's Max HP. This effect can be triggered up to 5 times based on the number of enemies hit.</p>
          <p className="mb-2">If Hu Tao's HP is below or equal to 50% when the enemy is hit, both the DMG and HP Regeneration are increased.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Low HP Skill DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.low_dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.low_dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Skill HP Regeneration",
          formulaText: (tlvl, stats) => <span>( {data.burst.regen[tlvl]}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.regen,
          variant: "success",
        }, {
          text: "Low HP Skill Regeneration",
          formulaText: (tlvl, stats, c) => <span>( {data.burst.low_regen[tlvl]}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.low_regen,
          variant: "success",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, (con) => con >= 2 && {
          text: "Apply the Blood Blossom effect",
        }]
      }],
    },
    passive1: {
      name: "Flutter By",
      img: passive1,
      document: [{ text: <span>When a <b>Paramita Papilio</b> state activated by <b>Guide to Afterlife</b> ends, all allies in the party (excluding Hu Tao herself) will have their CRIT Rate increased by 12% for 8s.</span> }],
      //TODO party buff
    },
    passive2: {
      name: "Sanguine Rouge",
      img: passive2,
      document: [{
        text: <span>When Hu Tao's HP is equal to or less than 50%, her <span className="text-pyro">Pyro DMG Bonus</span> is increased by 33%.</span>,
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "SanguineRouge",
          condition: "Sanguine Rouge",
          sourceKey: "hutao",
          maxStack: 1,
          stats: {
            pyro_dmg_: 33,
          },
        }
      }],
    },
    passive3: {
      name: "The More the Merrier",
      img: passive3,
      document: [{ text: <span>When Hu Tao cooks a dish perfectly, she has a 18% chance to receive an additional "Suspicious" dish of the same type.</span> }],
    },
    constellation1: {
      name: "Crimson Bouquet",
      img: c1,
      document: [{ text: <span>While in a <b>Paramita Papilio</b> state activated by <b>Guide to Afterlife</b>, Hu Tao's Charge Attacks do not consume Stamina.</span> }],
    },
    constellation2: {
      name: "Ominous Rainfall",
      img: c2,
      document: [{
        text: <span>
          <p className="mb-2">Increases the <b>Blood Blossom</b> DMG by an amount equal to 10% of Hu Tao's Max HP at the time the effect is applied.</p>
          <p className="mb-2">Additionally, <b>Spirit Soother</b> will also apply the <b>Blood Blossom</b> effect.</p>
        </span>
      }],
    },
    constellation3: {
      name: "Lingering Carmine",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Guide to Afterlife</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Garden of Eternal Rest",
      img: c4,
      document: [{ text: <span>Upon defeating an enemy affected by a <b>Blood Blossom</b> that Hu Tao applied herself, all nearby allies in the party (excluding Hu Tao herself) will have their CRIT Rate increased by 12% for 15s.</span> }],
      //TODO party buff
    },
    constellation5: {
      name: "Floral Incense",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Spirit Soother</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Butterfly's Embrace",
      img: c6,
      document: [{
        text: <span>
          <p className="mb-2">Triggers when Hu Tao's HP drops below 25%, or when she suffers a lethal strike:</p>
          <ul className="mb-1">
            <li>Hu Tao will not fall as a result of the DMG sustained. Additionally, for the next 10s, all of her Elemental and <span className="text-physical">Physical RES</span> is increased by 200%, her CRIT Rate is increased by 100%, and her resistance to interruption is greatly increased.</li>
            <li>This effect triggers automatically when Hu Tao has 1 HP left.</li>
            <li>Can only occur once every 60s.</li>
          </ul>
        </span>,
        conditional: (tlvl, c, a) => c >= 6 && {
          type: "character",
          conditionalKey: "ButterflysEmbrace",
          condition: "Butterfly's Embrace",
          sourceKey: "hutao",
          maxStack: 1,
          stats: {
            physical_res_: 200,
            anemo_res_: 200,
            geo_res_: 200,
            electro_res_: 200,
            hydro_res_: 200,
            pyro_res_: 200,
            cryo_res_: 200,
            critRate_: 100,
          },
          fields: [{
            text: "Duration",
            value: "10s"
          }, {
            text: "CD",
            value: "60s"
          }]
        }
      }],
    }
  },
};
export default char;
