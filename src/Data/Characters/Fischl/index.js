import card from './Character_Fischl_Card.jpg'
import thumb from './Character_Fischl_Thumb.png'
import c1 from './Constellation_Gaze_of_the_Deep.png'
import c2 from './Constellation_Devourer_of_All_Sins.png'
import c3 from './Constellation_Wings_of_Nightmare.png'
import c4 from './Constellation_Her_Pilgrimage_of_Bleak.png'
import c5 from './Constellation_Against_the_Fleeing_Light.png'
import c6 from './Constellation_Evernight_Raven.png'
import normal from './Talent_Bolts_of_Downfall.png'
import skill from './Talent_Nightrider.png'
import burst from './Talent_Midnight_Phantasmagoria.png'
import passive1 from './Talent_Stellar_Predator.png'
import passive2 from './Talent_Lightning_Smite.png'
import passive3 from './Talent_Mein_Hausgarten.png'
import Stat from '../../../Stat'
import Character from '../../../Character/Character'

//AUTO
const hitPercent = [
  [44.12, 47.71, 51.3, 56.43, 60.02, 64.13, 69.77, 75.41, 81.05, 87.21, 93.37, 99.52, 105.68, 111.83, 117.99],
  [46.78, 50.59, 54.4, 59.84, 63.65, 68, 73.98, 79.97, 85.95, 92.48, 99.01, 105.54, 112.06, 118.59, 125.12],
  [58.14, 62.87, 67.6, 74.36, 79.09, 84.5, 91.94, 99.37, 106.81, 114.92, 123.03, 131.14, 139.26, 147.37, 155.48],
  [57.71, 62.4, 67.1, 73.81, 78.51, 83.88, 91.26, 98.64, 106.02, 114.07, 122.12, 130.17, 138.23, 146.28, 154.33],
  [72.07, 77.93, 83.8, 92.18, 98.05, 104.75, 113.97, 123.19, 132.4, 142.46, 152.52, 162.57, 172.63, 182.68, 192.74],
]

const aimed = [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3]
const aimed_full = [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const eleSkill = {
  oz_dmg: [88.8, 95.46, 102.12, 111, 117.66, 124.32, 133.2, 142.08, 150.96, 159.84, 168.72, 177.6, 188.7, 199.8, 210.9],
  skill_dmg: [115.44, 124.1, 132.76, 144.3, 152.96, 161.62, 173.16, 184.7, 196.25, 207.79, 219.34, 230.88, 245.31, 259.74, 274.17],
}

//BURST
const eleBurst = {
  burst_dmg: [208, 223.6, 239.2, 260, 275.6, 291.2, 312, 332.8, 353.6, 374.4, 395.2, 416, 442, 468, 494],
}

let char = {
  name: "Fischl",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Corvus",
  titles: ["Prinzessin der Verurteilung", "Sovereign of Immernachtreich", "Ruler of the Ashen Darkness"],
  baseStat: {
    characterHP: [770, 1979, 2555, 3827, 4236, 4872, 5418, 6054, 6463, 7099, 7508, 8144, 8553, 9189],
    characterATK: [20, 53, 68, 102, 113, 130, 144, 161, 172, 189, 200, 216, 227, 244],
    characterDEF: [50, 128, 165, 247, 274, 315, 350, 391, 418, 459, 485, 526, 553, 594]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Bolts of Downfall",
      img: normal,
      infusable: false,
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
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, the dark lightning spirits of Immernachtreich shall heed the call of their Prinzessin and indwell the enchanted arrowhead. When fully indwelt, the Rachsüchtig Blitz shall deal immense <span className="text-electro">Electro DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{aimed[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Fully-Charged Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{aimed_full[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed_full[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c, true)]: aimed_full[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }, (c, a) => a >= 1 && {
          text: <span>Full Aimed Shot on Oz <span className="text-electro">AoE</span></span>,
          basicVal: (tlvl, stats, c) => <span>{aimed_full[tlvl]}% * 152.7% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed_full[tlvl] / 100) * (152.7 / 100) * stats[Character.getTalentStatKey("charged", c, true)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c, true)]: (aimed_full[tlvl] / 100) * (152.7 / 100) }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }]
      }],
    },
    skill: {
      name: "Nightrider",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Summons Oz. The night raven forged of darkness and lightning descends upon the land, dealing <span className="text-electro">Electro DMG</span> in a small AoE.</p>
          <p className="mb-0">For the ability's duration, Oz will continuously attack nearby opponents with <span className="text-electro">Freikugel</span>.</p>
          <p className="mb-0">Hold to adjust the location Oz will be summoned to.</p>
          <p className="mb-0">Press again any time during the ability's duration to once again summon him to Fischl's side.</p>
        </span>,
        fields: [{
          text: "Oz's ATK DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.oz_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.oz_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.oz_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (con, a) => ({
          text: "Summoning DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[tlvl]}%{con >= 2 ? " + 200%" : ""} {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => ((eleSkill.skill_dmg[tlvl] + (con >= 2 ? 200 : 0)) / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: (eleSkill.skill_dmg[tlvl] + (con >= 2 ? 200 : 0)) / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }), (con, a) => con >= 6 && {
          text: "Attack with Active Character",
          basicVal: (tlvl, stats, c) => <span>30% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (30 / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: 30 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (c, a) => ({
          text: "Duration",
          value: c < 6 ? "10s" : "10s + 2s",
        }), {
          text: "CD",
          value: "25s",
        }, (c, a) => c >= 2 && {
          text: "AoE Increase",
          value: "50%",
        }]
      }],
    },
    burst: {
      name: "Midnight Phantasmagoria",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Summons Oz to spread his twin wings of twilight and defend Fischl. Has the following properties during the ability's duration:</p>
          <ul>
            <li>Fischl takes on Oz's form, greatly increasing her Movement Speed.</li>
            <li>Strikes nearby opponents with lightning, dealing <span className="text-electro">Electro DMG</span> to opponents she comes in contact with. Each opponent can only be struck once.</li>
            <li>Once this ability's effects end, Oz will remain on the battlefield and attack his Prinzessin's foes. If Oz is already on the field, then this will reset the duration of his presence.</li>
          </ul>
        </span>,
        fields: [{
          text: "Falling Thunder DMG",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("burst", c)]: eleBurst.burst_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, (con, a) => con >= 4 && {
          text: "Additional AoE Damage",
          basicVal: (tlvl, stats, c) => <span>222% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (222 / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("burst", c)]: 222 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, (con, a) => con >= 4 && {
          text: "HP Recovered",
          basicVal: (tlvl, stats, c) => <span>( 20% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => 0.2 * stats.finalHP * stats.heal_multi,
          formula: () => ({ heal_multi: { finalHP: 0.2 } }),
          variant: "success"
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        },]
      }],
    },
    passive1: {
      name: "Stellar Predator",
      img: passive1,
      document: [{ text: <span>When Fischl hits <b>Oz</b> with a fully-charged <b>Aimed Shot</b>, Oz brings down Thundering Retribution, dealing <span className="text-electro">AoE Electro DMG</span> equal to 152.7% of the arrow's DMG.</span> }],
    },
    passive2: {
      name: "Undone Be Thy Sinful Hex",
      img: passive2,
      document: [{
        text: <span>If your active character triggers an <span className="text-electro">Electro-related Elemental Reaction</span> when Oz is on the field, the opponent shall be stricken with Thundering Retribution, dealing <span className="text-electro">Electro DMG</span> equal to 80% of Fischl's ATK.</span>,
        fields: [(con, a) => a >= 4 && {
          text: "Thundering Retribution",
          basicVal: (tlvl, stats, c) => <span>80% {Stat.printStat(Character.getTalentStatKey("ele", c), stats)}</span>,
          finalVal: (_, stats, c) => (80 / 100) * stats[Character.getTalentStatKey("ele", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("ele", c)]: 80 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("ele", c),
        }]
      }],
    },
    passive3: {
      name: "Mein Hausgarten",
      img: passive3,
      document: [{ text: <span>When dispatched on an expedition in Mondstadt, the time consumed is reduced by 25%.</span> }],
    },
    constellation1: {
      name: "Gaze of the Deep",
      img: c1,
      document: [{
        text: <span>Even when Oz is not present in combat, he can still watch over Fischl through the crow's eyes. When Fischl attacks an opponent, Oz fires a joint attack through the crow's eyes, dealing 22% of <span className="text-physical">ATK DMG</span>.</span>,
        fields: [(con) => con >= 1 && {
          text: "Joint Attack DMG",
          basicVal: (tlvl, stats, c) => <span>22% {Stat.printStat(Character.getTalentStatKey("phy", c), stats)}</span>,
          finalVal: (_, stats, c) => (22 / 100) * stats[Character.getTalentStatKey("phy", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("phy", c)]: 22 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("phy", c),
        }]
      }],
    },
    constellation2: {
      name: "Devourer of All Sins",
      img: c2,
      document: [{ text: <span>When <b>Nightrider</b> is used, it deals an additional 200% ATK as DMG, and its AoE is increased by 50%.</span> }],
    },
    constellation3: {
      name: "Wings of Nightmare",
      img: c3,
      document: [{ text: <span>Increases <b>Nightrider</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Her Pilgrimage of Bleak",
      img: c4,
      document: [{ text: <span>When <b>Midnight Phantasmagoria</b> is used, deals 222% of ATK as <span className="text-electro">Electro DMG</span> to surrounding opponents. When the skill duration ends, Fischl recovers 20% of her HP.</span> }],
    },
    constellation5: {
      name: "Against the Fleeing Light",
      img: c5,
      document: [{ text: <span>Increases <b>Midnight Phantasmagoria</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Evernight Raven",
      img: c6,
      document: [{ text: <span>Increases the duration of Oz's summoning by 2s. Additionally, Oz attacks with your active character when present, dealing 30% of Fischl's ATK as <span className="text-electro">Electro DMG</span>.</span> }],
    }
  },
};
export default char;
