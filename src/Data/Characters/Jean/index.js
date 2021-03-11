import card from './Character_Jean_Card.jpg'
import thumb from './Character_Jean_Thumb.png'
import c1 from './Constellation_Spiraling_Tempest.png'
import c2 from './Constellation_People\'s_Aegis.png'
import c3 from './Constellation_When_the_West_Wind_Arises.png'
import c4 from './Constellation_Lands_of_Dandelion.png'
import c5 from './Constellation_Outbursting_Gust.png'
import c6 from './Constellation_Lion\'s_Fang,_Fair_Protector_of_Mondstadt.png'
import normal from './Talent_Favonius_Bladework.png'
import skill from './Talent_Gale_Blade.png'
import burst from './Talent_Dandelion_Breeze.png'
import passive1 from './Talent_Wind_Companion.png'
import passive2 from './Talent_Let_the_Wind_Lead.png'
import passive3 from './Talent_Guiding_Breeze.png'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO
const hitPercent = [
  [48.33, 52.27, 56.2, 61.82, 65.75, 70.25, 76.43, 82.61, 88.8, 95.54, 103.27, 112.36, 121.44, 130.53, 140.44],
  [45.58, 49.29, 53, 58.3, 62.01, 66.25, 72.08, 77.91, 83.74, 90.1, 97.39, 105.96, 114.53, 123.1, 132.45],
  [60.29, 65.19, 70.1, 77.11, 82.02, 87.63, 95.34, 103.05, 110.76, 119.17, 128.81, 140.14, 151.48, 162.81, 175.18],
  [65.88, 71.24, 76.6, 84.26, 89.62, 95.75, 104.18, 112.6, 121.03, 130.22, 140.75, 153.14, 165.52, 177.91, 191.42],
  [79.21, 85.65, 92.1, 101.31, 107.76, 115.13, 125.26, 135.39, 145.52, 156.57, 169.23, 184.13, 199.02, 213.91, 230.16]
]

const charged_atk = [162.02, 175.21, 188.4, 207.24, 220.43, 235.5, 256.22, 276.95, 297.67, 320.28, 346.19, 376.65, 407.11, 437.58, 470.81]
const plunging_dmg = [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98]
const plunging_dmg_low = [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89]
const plunging_dmg_high = [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]

//SKILL
const galeBlade = {
  skill_dmg: [292, 313.9, 335.8, 365, 386.9, 408.8, 438, 467.2, 496.4, 525.6, 554.8, 584, 620.5, 657, 693.5]
}

//BURST
const dandelionBreeze = {
  burst_dmg: [424.8, 456.66, 488.52, 531, 562.86, 594.72, 637.2, 679.68, 722.16, 764.64, 807.12, 849.6, 902.7, 955.8, 1008.9],
  enter_exit_dmg : [78.4, 84.28, 90.16, 98, 103.88, 109.76, 117.6, 125.44, 133.28, 141.12, 148.96, 156.8, 166.6, 176.4, 186.2],
  heal_flat: [1540, 1694, 1861, 2041, 2234, 2439, 2657, 2888, 3132, 3389, 3659, 3941, 4236, 4544, 4865],
  heal_atk: [251.2, 270.04, 288.88, 314, 332.84, 351.68, 376.8, 401.92, 427.04, 452.16, 477.28, 502.4, 533.8, 565.2 , 596.6],
  regen_flat: [154, 169, 186, 204, 223, 244, 266, 289, 313, 339, 366, 394, 424, 454, 487],
  regen_atk: [25.12, 27, 28.89, 31.4, 33.28, 35.17, 37.68, 40.19, 42.7, 45.22 , 47.73, 50.24, 53.38, 56.52, 59.66],
}

let char = {
  name: "Jean",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Leo Minor",
  titles: ["Acting Grand Master", "Dandelion Knight", "Lionfang Knight"],
  baseStat: {
    characterHP: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
    characterATK: [19, 48, 64, 96, 108, 124, 139, 155, 166, 183, 194, 211, 222, 239],
    characterDEF: [60, 155, 206, 309, 345, 397, 446, 499, 535, 588, 624, 678, 715, 769]
  },
  specializeStat: {
    key: "heal_",
    value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
  },
  talent: {
    auto: {
      name: "Favonius Bladework",
      img: normal,
      normal: {
        text: <span><strong>Normal Attack</strong> Performs up to 5 consecutive strikes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          bbasicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      },
      charged: {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of stamina to launch an opponent using the power of wind. Launched opponents will slowly fall to the ground.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        },  {
          text: `Stamina Cost`,
          value: `20/s`,
        }]
      },
      plunging: {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
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
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }]
      }
    },
    skill: {
      name: "Gale Blade",
      img: skill,
      text: <span>TEMPLATE</span>,
      fields: [{
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{galeBlade.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (galeBlade.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: galeBlade.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
      }, {
        text: "Stamina Consumption (Hold)",
        value: "20/s",
      }, {
        text: "Max Hold Duration",
        value: "5s",
      }, {
        text: "CD",
        value: "6s",
      }]
    },
    burst: {
      name: "Dandelion Breeze",
      img: burst,
      text: <span>
          <p className="mb-2">Calling upon the wind's protection, Jean creates a swirling Dandelion Field, launching surrounding opponents and dealing <span className="text-anemo">Anemo DMG</span>. At the same time, she instantly regenerates a large amount of HP for all party members. The amount of HP restored scales off Jean's ATK.</p>
          <p className="mb-2"><b>Dandelion Field:</b></p>
          <ul className="mb-2">
            <li>Continuously regenerates HP of characters within the AoE and continuously imbues them with <span className="text-ameno">Ameno</span>.</li>
            <li>Deals <span className="text-anemo">Anemo DMG</span> to opponents entering or exiting the Dandelion Field.</li>
          </ul>
        </span>,
      fields: [{
        text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{dandelionBreeze.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (dandelionBreeze.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: dandelionBreeze.burst_dmg[tlvl] / 100 })
      }, {
          text: "Entering/Exiting Field DMG",
          basicVal: (tlvl, stats, c) => <span>{dandelionBreeze.enter_exit_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (dandelionBreeze.enter_exit_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: dandelionBreeze.enter_exit_dmg[tlvl] / 100 })
      }, {
        text: "Regeneration",
          basicVal: (tlvl, stats, c) => <span>( {dandelionBreeze.atk[tlvl]}% {Stat.printStat("finalAtk", stats)} + {dandelionBreeze.heal_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((dandelionBreeze.atk[tlvl] / 100) * stats.finalAtk + dandelionBreeze.heal_flat[tlvl]) * stats.heal_multi,
      }, {
          text: "Continuous Regeneration",
          basicVal: (tlvl, stats, c) => <span>( {dandelionBreeze.regen_atk[tlvl]}% ATK + {dandelionBreeze.regen_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((dandelionBreeze.regen_atk[tlvl] / 100) * stats.finalAtk + dandelionBreeze.regen_flat[tlvl]) * stats.heal_multi,
          formula: (tlvl) => ({ heal_multi: { finalHP: dandelionBreeze.regen_atk[tlvl] / 100, flat: dandelionBreeze.regen_flat[tlvl] } })
      }, {
        text: "Duration",
        value: "11s",
      }, {
        text: "CD",
        value: "20s",
      }, {
        text: "Energy Cost",
        value: 80,
      }]
    },
    passive1: {
      name: "Guiding Breeze",
      img: passive1,
      document: [{ text: <span>When a Perfect Cooking is achieved on a dish with restorative effects, Barbara has a 12% chance to obtain double the product.</span> }],
    },
    passive2: {
      name: "Wind Companion",
      img: passive2,
      document: [{ text: <span>On hit, Jean's Normal Attacks have a 50% change to regenerate HP equal to 15% of Jean's ATK for all party members.</span> }],
    },
    passive3: {
      name: "Let the Wind Lead",
      img: passive3,
      document: [{ text: <span>Using <b>Dandelion Breeze</b> will regenerate 20% of its Energy.</span> }],
    },
  },
  constellation: [{
    name: "Spiraling Tempest",
    img: c1,
    document: [{ text: <span>Increases the pulling speed of <b>Gale Blade</b> after holding for more than 1s, and increases the DMG dealt by 40%.</span> }],
  }, {
    name: "People's Aegis",
    img: c2,
    document: [{ text: <span>When Jean picks up an Elemental Orb/Particle, all party members have their Movement SPD and ATK SPD increased by 15% for 15s.</span> }],
  }, {
    name: "When the West Wind Arises",
    img: c3,
    document: [{ text: <span>Increases the level of <b>Dandelion Breeze</b> by 3. Maximum upgrade level is 15.</span> }],
  }, {
    name: "Lands of Dandelion",
    img: c4,
    document: [{ text: <span>Within the Field created by <b>Dandelion Breeze</b>, all opponents have their Anemo RES decreased by 40%</span> }],
  }, {
    name: "Outbursting Gust",
    img: c5,
    document: [{ text: <span>Increases the level of <b>Gale Blade</b> by 3. Maximum upgrade level is 15.</span> }],
  }, {
    name: "Lion's Fang, Fair Protector of Mondstandt",
    img: c6,
    document: [{ text: <span>Incoming DMG is decreased by 35% within the Field created by <b>Dandelion Breeze</b>. Upon leaving the Dandelion Field, this effect lasts for 3 attacks or 10s.</span> }],
  }],
};
export default char;
