import card from './Character_Beidou_Card.jpg'
import thumb from './Character_Beidou_Thumb.png'
import c1 from './Constellation_Sea_Beast\'s_Scourge.png'
import c2 from './Constellation_Upon_the_Turbulent_Sea,_the_Thunder_Arises.png'
import c3 from './Constellation_Summoner_of_Storm.png'
import c4 from './Constellation_Stunning_Revenge.png'
import c5 from './Constellation_Crimson_Tidewalker.png'
import c6 from './Constellation_Bane_of_the_Evil.png'
import normal from './Talent_Oceanborne.png'
import skill from './Talent_Tidecaller.png'
import burst from './Talent_Stormbreaker.png'
import passive1 from './Talent_Retribution.png'
import passive2 from './Talent_Lightning_Storm.png'
import passive3 from './Talent_Conqueror_of_Tides.png'
import WeaponPercent from '../../../Components/WeaponPercent'

//AUTO
const hitPercent = [
  [71.12, 76.91, 82.7, 90.97, 96.76, 103.38, 112.47, 121.57, 130.67, 140.59, 151.96, 165.33, 178.71, 192.08, 206.67],
  [70.86, 76.63, 82.4, 90.64, 96.41, 103, 112.06, 121.13, 130.19, 140.08, 151.41, 164.73, 178.06, 191.38, 205.92],
  [88.32, 95.51, 102.7, 112.97, 120.16, 128.38, 139.67, 150.97, 162.27, 174.59, 188.71, 205.32, 221.92, 238.53, 256.65],
  [86.52, 93.56, 100.6, 110.66, 117.7, 125.75, 136.82, 147.88, 158.95, 171.02, 184.85, 201.12, 217.39, 233.65, 251.4],
  [112.14, 121.27, 130.4, 143.44, 152.57, 163, 177.34, 191.69, 206.03, 221.68, 239.61, 260.7, 281.78, 302.87, 325.87],
]

const charged_atk_spinnning = [56.24, 60.82, 65.4, 71.94, 76.52, 81.75, 88.94, 96.14, 103.33, 111.18, 120.17, 130.75, 141.32, 151.9, 163.43]
const charged_atk_final = [101.82, 110.11, 118.4, 130.24, 138.53, 148, 161.02, 174.05, 187.07, 201.28, 217.56, 236.71, 255.85, 275, 295.88]
const plunge_dmg = [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48]
const plunge_dng_low = [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87]
const plunge_dmg_high = [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21]

//SKILL
const tideCaller = {
  hp: [14.4, 15.48, 16.56, 18, 19.08, 20.16, 21.6, 23.04, 24.48, 25.92, 27.36, 28.8, 30.6, 32.4, 34.2],
  flat: [1386, 1525, 1675, 1837, 2010, 2195, 2392, 2600, 2819, 3050, 3293, 3547, 3813, 4090, 4379],
  base_dmg: [121.6, 130.72, 139.84, 152, 161.12, 170.24, 182.4, 194.56, 206.72, 218.88, 231.04, 243.2, 258.4, 273.6, 288.8],
  dmg_bonus_on_hit: [160, 172, 184, 200, 212, 224, 240, 256, 272, 288, 304, 320, 340, 360, 380],
}

//BURST
const stormbreaker = {
  skill_dmg: [121.6, 130.72, 139.84, 152, 161.12, 170.24, 182.4, 194.56, 206.72, 218.88, 231.04, 243.2, 258.4, 273.6, 288.8],
  lightning_dmg: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
  dmg_red: [20, 21, 22, 24, 25, 26, 28, 30, 32, 34, 35, 36, 37, 38, 39],
}

let char = {
  name: "Beidou",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: "Victor Mare",
  titles: ["Uncrowned Lord of Ocean", "Queen of the Crux Fleet"],
  baseStat: {
    hp: [1094, 2811, 3628, 5435, 6015, 6919, 7694, 8597, 9178, 10081, 10662, 11565, 12146, 13050],
    atk: [19, 49, 63, 94, 104, 119, 133, 148, 158, 174, 184, 200, 210, 225],
    def: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
  },
  specializeStat: {
    key: "electro_ele_dmg",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Oceanborne",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 successive strikes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl) => percentArr[tlvl] + "%",
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.norm_atk_avg_dmg
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous slashes. At end of the sequence, perform a more powerful slash.</span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl) => charged_atk_spinnning[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_spinnning[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl) => charged_atk_final[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_final[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunge_dng_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dng_low[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg_high[tlvl] / 100) * stats.phy_avg_dmg
        }]
      }],
    },
    skill: {
      name: "Tidecaller",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Nothing to worry about. Should anyone raise a hand against her or her men, she will avenge it ten-fold with sword and thunder.</p>
          <p className="mb-2"><strong>Press:</strong> Accumulating the power of lightning, Beidou swings her blade forward fiercely, dealing <span className="text-electro">Electro DMG</span>.</p>
          <p className="mb-2">
            <strong>Hold:</strong> Lifts her weapon up as a shield. Max DMG absorbed scales off Beidou's Max HP.
          Attacks using the energy stored within the greatsword upon release or once this ability's duration expires, dealing <span className="text-electro">Electro DMG</span>. DMG dealt scales with the number of times beidou is attacked in the skill's duration. The greatest DMG Bonus will be attained once this effect is triggered twice.
          The shield possesses the following properties:
          <ul className="mb-1">
              <li>Has 250% <span className="text-electro">Electro DMG</span> Absorption Efficiency.</li>
              <li>Applies the <span className="text-electro">Electro element</span> to Beidou upon activation.</li>
            </ul>
        Generate 2 elemental particles when it hit at least 1 target, or 4 when hit with energy stored.
        </p>
        </span>,
        fields: [{
          text: "Shield DMG Absorption",
          basicVal: (tlvl) => tideCaller.hp[tlvl] + "% Max HP + " + tideCaller.flat[tlvl],
          finalVal: (tlvl, s) => (tideCaller.hp[tlvl] / 100) * s.hp + tideCaller.flat[tlvl],
        }, {
          text: "Base DMG",
          basicVal: (tlvl) => tideCaller.base_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (tideCaller.base_dmg[tlvl] / 100) * s.skill_avg_dmg,
        }, {
          text: "DMG Bonus on Hit Taken",
          basicVal: (tlvl) => tideCaller.dmg_bonus_on_hit[tlvl] + "%",
          finalVal: (tlvl, s) => (tideCaller.dmg_bonus_on_hit[tlvl] / 100) * s.skill_avg_dmg,
        }, {
          text: "CD",
          value: "7.5s",
        }]
      }],
    },
    burst: {
      name: "Stormbreaker",
      img: burst,
      document: [{
        text: <span>
          <p>Recalling her slaying of the great beast Haishan, Beidou calls upon that monstrous strength and the lightning to create a Thunderbeast's Targe around herself, dealing <span className="text-electro">Electro DMG</span> to nearby enemies.</p>
          <h6>Thunderbeast's Targe:</h6>
          <ul className="mb-1">
            <li>When Normal and Charged Attacks hit, they create a lightning discharge that can jump between enemies, dealing <span className="text-electro">Electro DMG</span>.</li>
            <li>Increases the character's resistance to interruption, and decreases DMG taken.</li>
            <li>Triggers a maximum of 1 lightning discharge per second.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill DMG",
          basicVal: (tlvl) => stormbreaker.skill_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (stormbreaker.skill_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, {
          text: "Lightning DMG",
          basicVal: (tlvl) => stormbreaker.lightning_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (stormbreaker.lightning_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, {
          text: "DMG Reduction",
          value: (tlvl) => stormbreaker.dmg_red[tlvl] + "%",
        }, {
          text: "Duration",
          value: "20s",
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
      name: "Retribution",
      img: passive1,
      document: [{ text: <span>Counterattacking with <b>Tidecaller</b> at the precise moment when the character is hit grants the maximum DMG Bonus.</span> }],
    },
    passive2: {
      name: "Lightning Storm",
      img: passive2,
      document: [{
        text: <span>
          Gain the following effects for 10s after unleashing <b>Tidecaller</b> with its maximum DMG Bonus:
          <ul className="mb-0">
            <li>DMG dealt by Normal and Charged Attacks is increased by 15%. ATK SPD of Normal and Charged Attacks is increased by 15%.</li>
            <li>Greatly reduced delay before unleashing Charged Attacks.</li>
          </ul>
        </span>
      }],
      //TODO conditional
    },
    passive3: {
      name: "Conqueror of Tides",
      img: passive3,
      document: [{
        text: <span>
          Decreases swimming Stamina consumption of your characters in the party by 20%.
          Not stackable with Passive Talents that provide the exact same effects.
        </span>
      }],
    },
    constellation1: {
      name: "Sea Beast's Scourge",
      img: c1,
      document: [{ text: (s) => <span>When <b>Stormbreaker</b> is used: Creates a shield that absorbs up to 16% of Beidou's Max HP{WeaponPercent(16, s.hp)} for 15s. This shield absorbs <span className="text-electro">Electro DMG</span> 250% more effectively.</span> }],
    },
    constellation2: {
      name: "Upon the Turbulent Sea, the Thunder Arises",
      img: c2,
      document: [{ text: <span><b>Stormbreaker</b>'s arc lightning can jump to 2 additional targets.</span> }],
    },
    constellation3: {
      name: "Summoner of Storm",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Tidecaller</b> by 3. Maximum upgrade level is 15.</span> }],
    },
    constellation4: {
      name: "Stunning Revenge",
      img: c4,
      document: [{ text: <span>Within 10s of taking DMG, Beidou's Normal Attacks gain 20% additional <span className="text-electro">Electro DMG</span>.</span> }],
    },
    constellation5: {
      name: "Crimson Tidewalker",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Stormbreaker</b> by 3. Maximum upgrade level is 15.</span> }],
    },
    constellation6: {
      name: "Bane of the Evil",
      img: c6,
      document: [{ text: <span>During the duration of <b>Stormbreaker</b>, the <span className="text-electro">Electro RES</span> of surrounding enemies is decreased by 15%.</span> }],
    },
  },
};
export default char;
