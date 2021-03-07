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
import Character from '../../../Character/Character'

//AUTO
const hitPercent = [
  [89.7, 97, 104.3, 114.73, 122.03, 130.38, 141.85, 153.32, 164.79, 177.31, 191.65, 208.52, 225.38, 242.25, 260.65],
  [87.63, 94.77, 101.9, 112.09, 119.22, 127.38, 138.58, 149.79, 161, 173.23, 187.24, 203.72, 220.2, 236.67, 254.65],
  [98.81, 106.86, 114.9, 126.39, 134.43, 143.63, 156.26, 168.9, 181.54, 195.33, 211.13, 229.71, 248.29, 266.87, 287.14],
  [133.99, 144.89, 155.8, 171.38, 182.29, 194.75, 211.89, 229.03, 246.16, 264.86, 286.28, 311.48, 336.67, 361.86, 389.34],
]

const charged_atk_spinnning = [68.8, 74.4, 80, 88, 93.6, 100, 108.8, 117.6, 126.4, 136, 147, 159.94, 172.87, 185.81, 199.92]
const charged_finalATK = [124.7, 134.85, 145, 159.5, 169.65, 181.25, 197.2, 213.15, 229.1, 246.5, 266.44, 289.88, 313.33, 336.78, 362.36]
const plunging_dmg = [89.51, 96.79, 104.08, 114.48, 121.77, 130.1, 141.54, 152.99, 164.44, 176.93, 189.42, 201.91, 214.4, 226.89, 239.37]
const plunging_dmg_low = [178.97, 193.54, 208.11, 228.92, 243.49, 260.13, 283.03, 305.92, 328.81, 353.78, 378.76, 403.73, 428.7, 453.68, 478.65]
const plunging_dmg_high = [223.55, 241.74, 259.94, 285.93, 304.13, 324.92, 353.52, 382.11, 410.7, 441.89, 473.09, 504.28, 535.47, 566.66, 597.86]

//SKILL
const searing = {
  hit1: [94.4, 101.48, 108.56, 118, 125.08, 132.16, 141.6, 151.04, 160.48, 169.92, 179.36, 188.8, 200.6, 212.4, 224.2],
  hit2: [97.6, 104.92, 112.24, 122, 129.32, 136.64, 146.4, 156.16, 165.92, 175.68, 185.44, 195.2, 207.4, 219.6, 231.8],
  hit3: [128.8, 138.46, 148.12, 161, 170.66, 180.32, 193.2, 206.08, 218.96, 231.84, 244.72, 257.6, 273.7, 289.8, 305.9],
}

//BURST
const dawn = {
  slashing: [204, 219.3, 234.6, 255, 270.3, 285.6, 306, 326.4, 346.8, 367.2, 387.6, 408, 433.5, 459, 484.5],
  dot: [60, 64.5, 69, 75, 79.5, 84, 90, 96, 102, 108, 114, 120, 127.5, 135, 142.5],
  explosion: [204, 219.3, 234.6, 255, 270.3, 285.6, 306, 326.4, 346.8, 367.2, 387.6, 408, 433.5, 459, 484.5],
}

let char = {
  name: "Diluc",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Noctua",
  titles: ["The Dark Side of Dawn", "Darknight Hero", "The Uncrowned King of Mondstadt"],
  baseStat: {
    characterHP: [1011, 2621, 3488, 5219, 5834, 6712, 7533, 8421, 9036, 9932, 10547, 11453, 12068, 12981],
    characterATK: [26, 68, 90, 135, 151, 173, 194, 217, 233, 256, 272, 295, 311, 335],
    characterDEF: [61, 158, 211, 315, 352, 405, 455, 509, 546, 600, 637, 692, 729, 784]
  },
  specializeStat: {
    key: "critRate_",
    value: [0, 0, 0, 0, 4.8, 4.8, 9.6, 9.6, 9.6, 9.6, 14.4, 14.4, 19.2, 19.2]
  },
  talent: {
    auto: {
      name: "Tempered Sword",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 consecutive strikes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c)
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous slashes. At the end of the sequence, perform a more powerful slash.</span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_spinnning[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_spinnning[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_spinnning[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c)
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_finalATK[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_finalATK[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_finalATK[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c)
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
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c)
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c)
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c)
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
        fields: [{
          text: "1-Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{searing.hit1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (searing.hit1[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: searing.hit1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
        }, {
          text: "2-Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{searing.hit2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (searing.hit2[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: searing.hit2[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
        }, {
          text: "3-Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{searing.hit3[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (searing.hit3[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: searing.hit3[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
        }, (c) => {
          if (c < 4) return null
          return {
            text: "2-Hit DMG(Boosted)",
            basicVal: (tlvl, stats, c) => <span>{searing.hit2[tlvl]}% + 40% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
            finalVal: (tlvl, stats, c) => ((searing.hit2[tlvl] + 40) / 100) * stats[Character.getTalentStatKey("skill", c)],
            formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: (searing.hit2[tlvl] + 40) / 100 }),
            variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
          }
        }, (c) => {
          if (c < 4) return null
          return {
            text: "3-Hit DMG(Boosted)",
            basicVal: (tlvl, stats, c) => <span>{searing.hit3[tlvl]}% + 40% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
            finalVal: (tlvl, stats, c) => ((searing.hit3[tlvl] + 40) / 100) * stats[Character.getTalentStatKey("skill", c)],
            formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("skill", c)]: (searing.hit3[tlvl] + 40) / 100 }),
            variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c)
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
        fields: [{
          text: "Slashing DMG",
          basicVal: (tlvl, stats, c) => <span>{dawn.slashing[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (dawn.slashing[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("burst", c)]: dawn.slashing[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c)
        }, {
          text: "DoT",
          basicVal: (tlvl, stats, c) => <span>{dawn.dot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (dawn.dot[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("burst", c)]: dawn.dot[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c)
        }, {
          text: "Explosion DMG",
          basicVal: (tlvl, stats, c) => <span>{dawn.explosion[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (dawn.explosion[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: dawn.explosion[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c)
        }, {
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
