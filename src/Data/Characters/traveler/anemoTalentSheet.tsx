import c1 from './Constellation_Raging_Vortex.png'
import c2 from './Constellation_Uprising_Whirlwind.png'
import c3 from './Constellation_Sweeping_Gust.png'
import c4 from './Constellation_Cherishing_Breezes.png'
import c5 from './Constellation_Vortex_Stellaris.png'
import c6 from './Constellation_Interwinded_Winds.png'
import normal from './Talent_Foreign_Ironwind.png'
import skill from './Talent_Palm_Vortex.png'
import burst from './Talent_Gust_Surge.png'
import passive1 from './Talent_Slitting_Wind.png'
import passive2 from './Talent_Second_Wind.png'
import ElementalData from '../../ElementalData'
import Stat from '../../../Stat'
import formula, { data } from './anemoData'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { TalentSheet } from '../../../Types/character';
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { absorbableEle } from '../dataUtil'

const conditionals: IConditionals = {
  q: { // Absorption
    name: "Elemental Absorption",
    states: {
      ...Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
        name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
        fields: [{
          canShow: stats => {
            const value = stats.conditionalValues?.character?.traveler?.sheet?.talents?.anemo?.q as IConditionalValue | undefined
            if (!value) return false
            const [num, condEleKey] = value
            if (!num || condEleKey !== eleKey) return false
            return true
          },
          text: "Absorption DoT",
          formulaText: stats => <span>{data.burst.dmg_[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
          formula: formula.burst[eleKey],
          variant: eleKey
        },],
        stats: stats => ({
          ...stats.constellation >= 6 && { anemo_enemyRes_: - 20 },
          ...stats.constellation >= 6 && { [`${eleKey}_enemyRes_`]: -20 }
        })
      }]))
    }
  },
  c2: {
    name: "Uprising Whirlwind",
    stats: { enerRech_: 16 }
  }
}
const talentSheet: TalentSheet = {
  formula,
  conditionals,
  sheets: {
    auto: {
      name: "Foreign Ironwind",
      img: normal,
      sections: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: data.charged.hitArr.map((percentArr, i) =>
        ({
          text: i === 1 ? `Male Charged 2-Hit DMG` : (i === 2 ? `Female Charged 2-Hit DMG` : `Charged ${i + 1}-Hit DMG`),
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged[i],
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }))
      }, {
        text: <span><strong>Plunging Attack</strong> Plugnes from mid-air to strike the ground below, damaing enemies along the path and ealing AoE DMG upon impact.</span>,
        fields: [{
          text: "Plunge DMG",
          formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: "Low Plunge DMG",
          formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: "High Plunge DMG",
          formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }]
      }]
    },
    skill: {
      name: "Palm Vortex",
      img: skill,
      sections: [{
        text: <span>
          <p className="mb-2">Grasping the wind's might, you form a vortext of vacuum in your palm, causing continous <span className="text-anemo">Anemo DMG</span> to enemies in front of you. The vacuum vortext explodes when the skill duration ends, causing a greater amount of Anemo DMG over a larger area.</p>
          <p className="mb-2">
            <strong>Hold:</strong> DMG and AoE will gradually increase.
        </p>
          <p><strong>Elemental Absorption:</strong> If the votext comes into contact with <span className="text-hydro">Hydro</span>/<span className="text-pyro">Pyro</span>/<span className="text-cryo">Cryo</span>/<span className="text-electro">Electro</span> elements, it will deal additional elemental DMG of that type. Elemental Absorption may only occur once per use.</p>
        </span>,
        fields: [{
          text: "Initial Cutting DMG",
          formulaText: stats => <span>{data.skill.initial_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.initial_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Max Cutting DMG",
          formulaText: stats => <span>{data.skill.initial_max[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.initial_max,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Initial Storm DMG",
          formulaText: stats => <span>{data.skill.storm_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.storm_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Max Storm DMG",
          formulaText: stats => <span>{data.skill.storm_max[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.storm_max,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Base CD",
          value: "5s",
        }, {
          text: "Max Charging CD",
          value: "8s",
        }, {
          canShow: stats => stats.constellation >= 4,
          text: "Reduce DMG taken while casting",
          value: "10%",
        }],
      }],
    },
    burst: {
      name: "Gust Surge",
      img: burst,
      sections: [{
        text: <span>
          <p className="mb-2">Guiding the path of the wind currents, you summon a forward-moving tornado that pulls objects and opponents towards itself, dealing continous <span className="text-anemo">Anemo DMG</span>.</p>
          <p className="mb-2"><strong>Elemental Absorption:</strong> If the tornado comes into contact with <span className="text-hydro">Hydro</span>/<span className="text-pyro">Pyro</span>/<span className="text-cryo">Cryo</span>/<span className="text-electro">Electro</span> elements, it will deal additional elemental DMG of that type. Elemental Absorption may only occur once per use.</p>
        </span>,
        fields: [{
          text: "Tornado DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "6s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: conditionals.q
      }],
    },
    passive1: {
      name: "Slitting Wind",
      img: passive1,
      sections: [{
        text: <span>The last hit of a Normal Attack combo unleases a wind blade, dealing 60% of ATK as <span className="text-anemo">Anemo DMG</span> to all opponents in its path.</span>,
        fields: [{
          text: "Anemo Auto",
          formulaText: stats => <span>60% * {Stat.printStat("finalATK", stats)}</span>,
          formula: formula.passive1.windAuto,
          variant: stats => getTalentStatKeyVariant("normal", stats, "anemo"),
        }]
      }]
    },
    passive2: {
      name: "Second Wind",
      img: passive2,
      sections: [{
        text: <span>Palm Vortext kills regenerate 2% HP for 5s. This effect can only occur once every 5s</span>,
        fields: [{
          text: "Heal",
          formulaText: stats => <span>2% * {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.passive2.heal,
          variant: "success",
        }]
      }]
    },
    constellation1: {
      name: "Raging Vortext",
      img: c1,
      sections: [{ text: <span>Palm Vortex pulls in enemies within a 5m radius.</span> }]
    },
    constellation2: {
      name: "Uprising Whirlwind",
      img: c2,
      sections: [{
        text: <span>Increases Energy Recharge by 16%.</span>,
        conditional: conditionals.c2
      }]
    },
    constellation3: {
      name: "Sweeping Gust",
      img: c3,
      sections: [{ text: <span>Increases the Level of <b>Gust Surge</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { burstBoost: 3 }
    },
    constellation4: {
      name: "Cherishing Breeze",
      img: c4,
      sections: [{ text: <span>Reduces DMG taken while casting <b>Palm Vortex</b> by 10%.</span> }]
    },
    constellation5: {
      name: "Vortext Stellaris",
      img: c5,
      sections: [{ text: <span>Increases the Level of <b>Palm Vortex</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { skillBoost: 3 }
    },
    constellation6: {
      name: "Intertwined Winds",
      img: c6,
      sections: [{ text: <span>Targets who take DMG from <b>Gust Surge</b> have their <span className="text-anemo">Anemo RES</span> decreased by 20%. If an Elemental Absorption occurred, then their RES towards the corresponding Element is also decreased by 20%.</span> }]
    },
  },
}
export default talentSheet