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
import Character from '../../../Character/Character'

//AUTO
const hitPercent = [
  [46.89, 50.08, 53.28, 57.54, 60.74, 64.47, 69.26, 74.06, 78.85, 83.65, 88.44, 93.24, 98.04, 102.83, 107.63],
  [48.25, 51.54, 54.83, 59.22, 62.51, 66.35, 71.28, 76.22, 81.15, 86.09, 91.02, 95.96, 100.89, 105.83, 110.76],
  [61.05, 65.21, 69.38, 74.93, 79.09, 83.94, 90.19, 96.43, 102.68, 108.92, 115.16, 121.41, 127.65, 133.89, 140.14],
  [65.64, 70.12, 74.59, 80.56, 85.03, 90.26, 96.97, 103.68, 110.4, 117.11, 123.82, 130.54, 137.25, 143.96, 150.68],
  [33.27, 35.54, 37.81, 40.84, 43.1, 45.75, 49.15, 52.56, 55.96, 59.36, 62.77, 66.17, 69.57, 72.98, 76.38],//5.1
  [35.2, 37.6, 40, 43.2, 45.6, 48.4, 52, 55.6, 59.2, 62.8, 66.4, 70, 73.6, 77.2, 80.8],//5.2
  [85.96, 91.82, 97.68, 105.49, 111.36, 118.19, 126.98, 135.78, 144.57, 153.36, 162.15, 170.94, 179.73, 188.52, 197.31],//6
]

const charged_atk = [135.96, 145.23, 154.5, 166.86, 176.13, 186.95, 200.85, 214.76, 228.66, 242.57, 256.47, 270.38, 284.28, 298.19, 312.09]
const plunge_dmg = [65.42, 69.88, 74.34, 80.29, 84.75, 89.95, 96.64, 103.33, 110.02, 116.71, 123.4, 130.1, 136.79, 143.48, 150.17]
const plunge_dmg_low = [130.81, 139.73, 148.65, 160.54, 169.46, 179.86, 193.24, 206.62, 220, 233.38, 246.76, 260.13, 273.51, 286.89, 300.27]
const plunge_dmg_high = [163.39, 174.53, 185.67, 200.52, 211.66, 224.66, 241.37, 258.08, 274.79, 291.5, 308.21, 324.92, 341.63, 358.34, 375.05]

//SKILL
const eleSkill = {
  atk_inc: [3.84, 4.07, 4.3, 4.6, 4.83, 5.06, 5.36, 5.66, 5.96, 6.26, 6.56, 6.85, 7.15, 7.45, 7.75],
  skill_dmg: [64, 68.8, 73.6, 80, 84.8, 89.6, 96, 102.4, 108.8, 115.2, 121.6, 128, 136, 144, 152],
}

//BURST
const eleBurst = {
  burst_dmg: [303.27, 321.43, 339.59, 363.2, 381.36, 399.52, 423.13, 446.74, 470.34, 493.95, 517.56, 541.17, 564.78, 588.38, 611.99],
  burst_low_dmg: [379.09, 401.79, 424.49, 454, 476.7, 499.4, 528.91, 558.42, 587.93, 617.44, 646.95, 676.46, 705.97, 735.48, 764.99],
  regen: [6.26, 6.64, 7.01, 7.5, 7.88, 8.25, 8.74, 9.23, 9.71, 10.2, 10.69, 11.18, 11.66, 12.15, 12.64],
  regen_low: [8.35, 8.85, 9.35, 10, 10.5, 11, 11.65, 12.3, 12.95, 13.6, 14.25, 14.9, 15.55, 16.2, 16.85]
}

let char = {
  name: "Hu Tao",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: "Papilio Charontis",
  titles: ["Fragrance in Thaw", "77th-Generation Director of the Wangsheng Funeral Parlor", "Director Hu", "Liyue Harbor's \"Versemonger of the Darkest Alleys\""],
  baseStat: {
    hp_base: [1211, 3141, 4179, 6253, 6990, 8042, 9026, 10089, 10826, 11899, 12637, 13721, 14459, 15552],
    atk_character_base: [8, 21, 29, 43, 48, 55, 62, 69, 74, 81, 86, 94, 99, 106],
    def_base: [68, 177, 235, 352, 394, 453, 508, 568, 610, 670, 712, 773, 815, 876]
  },
  specializeStat: {
    key: "crit_dmg",
    value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
  },

  talent: {
    auto: {
      name: "Secret Spear of Wangsheng",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 rapid strikes. <small><i>Note: the 5th attack hits twice.</i></small></span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + (i < 5 ? 1 : 0)}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("norm_atk", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("norm_atk", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("norm_atk", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to lunge forward, dealing damage to enemies along the way.</span>,
        fields: [{
          text: `Charged Attack`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk[tlvl]}% {Stat.printStat(Character.getTalentStatKey("char_atk", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk[tlvl] / 100) * stats[Character.getTalentStatKey("char_atk", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("char_atk", c),
        }, {
          text: `Stamina Cost`,
          value: 25,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunge_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunge", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunge_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunge", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunge_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunge", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunge_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunge", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunge_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunge", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunge_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunge", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunge", c),
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
          //TODO cap this at 400% baseATK
          text: "ATK Increase",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.atk_inc[tlvl]}% {Stat.printStat("hp_final", stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.atk_inc[tlvl] / 100) * stats.hp_final,
        }, {
          text: "Blood Blossom DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
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
            modifiers: { atk_final: { hp_final: eleSkill.atk_inc[tlvl] / 100, } },
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
          basicVal: (tlvl, stats, c) => <span>{eleBurst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Low HP Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.burst_low_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.burst_low_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Skill HP Regeneration",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.regen[tlvl]}% {Stat.printStat("hp_final", stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.regen[tlvl] / 100) * stats.hp_final,
          variant: "success",
        }, {
          text: "Low HP Skill Regeneration",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.regen_low[tlvl]}% {Stat.printStat("hp_final", stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.regen_low[tlvl] / 100) * stats.hp_final,
          variant: "success",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
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
            pyro_ele_dmg_bonus: 33,
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
          <small>NOTE: this damage is currently not applied. Calculations for this will be available pending a GO system change.</small>
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
          stats: {//TODO use a loop for the elemental data after v4
            phy_res: 200,
            anemo_ele_res: 200,
            geo_ele_res: 200,
            electro_ele_res: 200,
            hydro_ele_res: 200,
            pyro_ele_res: 200,
            cryo_ele_res: 200,
            crit_rate: 100,
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
