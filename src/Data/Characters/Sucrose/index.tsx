import card from './Character_Sucrose_Card.jpg'
import thumb from './Character_Sucrose_Thumb.png'
import c1 from './Constellation_Clustered_Vacuum_Field.png'
import c2 from './Constellation_Beth_Unbound_Form.png'
import c3 from './Constellation_Flawless_Alchemistress.png'
import c4 from './Constellation_Alchemania.png'
import c5 from './Constellation_Caution_Standard_Flask.png'
import c6 from './Constellation_Chaotic_Entropy.png'
import normal from './Talent_Wind_Spirit_Creation.png'
import skill from './Talent_Astable_Anemohypostasis_Creation_-_6308.png'
import burst from './Talent_Forbidden_Creation_-_Isomer_75_Type_II.png'
import passive1 from './Talent_Catalyst_Conversion.png'
import passive2 from './Talent_Mollis_Favonius.png'
import passive3 from './Talent_Astable_Invention.png'
import ElementalData from '../../ElementalData'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { absorbableEle } from '../dataUtil'
const conditionals: IConditionals = {
  q: { // Absorption
    name: "Elemental Absorption",
    states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
      name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
      fields: [{
        canShow: stats => {
          const value = stats.conditionalValues?.character?.sucrose?.sheet?.talent?.q as IConditionalValue | undefined
          if (!value) return false
          const [num, condEleKey] = value
          if (!num || condEleKey !== eleKey) return false
          return true
        },
        text: "Absorption DoT",
        formulaText: stats => <span>{data.burst.dmg_[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
        formula: formula.burst[eleKey],
        variant: eleKey
      }]
    }]))
  }
}
const char: ICharacterSheet = {
  name: "Sucrose",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "anemo",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Ampulla",
  titles: ["Harmless Sweetie", "Knights of Favonius Alchemist"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: "Wind Spirit Creation",
        img: normal,
        sections: [{
          text: <span><strong>Normal Attack</strong> Performs up to 4 attacks using Wind Spirits, dealing <span className="text-anemo">Anemo DMG</span>.</span>,
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina and deals <span className="text-anemo">AoE Anemo DMG</span> after a short casting time.</span>,
          fields: [{
            text: "Charged Attack DMG",
            formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: "Stamina Cost",
            value: "50"
          }]
        }, {
          text: <span><strong>Plunging Attack</strong> Calling upon the power of her Wind Spirits, Sucrose plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-anemo">AoE Anemo DMG</span> upon impact with the ground.</span>,
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
        }],
      },
      skill: {
        name: "Astable Anemohypostasis Creation - 6308",
        img: skill,
        sections: [{
          text: <span>Creates a small Wind Spirit that pulls opponents and objects towards its location, launches opponents within its AoE, and deals Anemo DMG.</span>,
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "15s"
          }]
        }]
      },
      burst: {
        name: "Forbidden Creation - Isomer 75 / Type II",
        img: burst,
        sections: [{
          text: <span>
            <p className="mb-2">Sucrose hurls an unstable concoction that creates a Large Wind Spirit.</p>
            <p className="mb-2">While it persists, the Large Wind Spirit will continuously pull in surrounding opponents and objects, launch nearby opponents, and deal <span className="text-anemo">Anemo DMG</span>.</p>
            <p className="mb-2">If the Wind Spirit comes into contact with <span className="text-hydro">Hydro</span>/<span className="text-pyro">Pyro</span>/<span className="text-cryo">Cryo</span>/<span className="text-electro">Electro</span> energy, it will deal additional elemental DMG of that type.</p>
            <p className="mb-0">Elemental Absorption may only occur once per use.</p>
          </span>,
          fields: [{
            text: "DoT",
            formulaText: stats => <span>{data.burst.dot[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dot,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: "6s"
          }, {
            text: "CD",
            value: "20s"
          }, {
            text: "Energy Cost",
            value: "80"
          }],
          conditional: conditionals.q
        }]
      },
      passive1: {
        name: "Astable Invention",
        img: passive1,
        sections: [{ text: <span>When Sucrose crafts Character and Weapon Enhancement Materials, she has a 10% to obtain double the product.</span> }],
      },
      passive2: {
        name: "Catalyst Conversion",
        img: passive2,
        sections: [{ text: <span>When Sucrose triggers a Swirl reaction, all characters in the party with the matching element (excluding Sucrose) have their Elemental Mastery increased by 50 for 8s.</span> }],
      },
      passive3: {
        name: "Mollis Favonius",
        img: passive3,
        sections: [{ text: <span>When Astable Anemohypostasis Creation - 6308 or Forbidden Creation - Isomer 75 / Type II hits an opponent, increases all party members' (excluding Sucrose) Elemental Mastery by an amount equal to 20% of Sucrose's Elemental Mastery for 8s.</span> }],
      },
      constellation1: {
        name: "Clustered Vacuum Field",
        img: c1,
        sections: [{ text: <span>Astable Anemohypostasis Creation - 6308 gains 1 additional charge.</span> }],
      },
      constellation2: {
        name: "Beth: Unbound Form",
        img: c2,
        sections: [{ text: <span>The duration of Forbidden Creation - Isomer 75 / Type II is increased by 2s.</span> }],
      },
      constellation3: {
        name: "Flawless Alchemistress",
        img: c3,
        stats: { skillBoost: 3 },
        sections: [{
          text: <span>
            Increases the Level of Astable Anemohypostasis Creation - 6308 by 3.<br />
        Maximum upgrade level is 15.
      </span>
        }],
      },
      constellation4: {
        name: "Alchemania",
        img: c4,
        sections: [{ text: <span>Every 7 Normal and Charged Attacks, Sucrose will reduce the CD of Astable Anemohypostasis Creation - 6308 by 1-7s.</span> }],
      },
      constellation5: {
        name: "Caution: Standard Flask",
        img: c5,
        stats: { burstBoost: 3 },
        sections: [{
          text: <span>
            Increases the Level of Forbidden Creation - Isomer 75 / Type II by 3.<br />
        Maximum upgrade level is 15.
      </span>
        }],
      },
      constellation6: {
        name: "Chaotic Entropy",
        img: c6,
        sections: [{ text: <span>If Forbidden Creation - Isomer 75 / Type II triggers an Elemental Absorption, all party members gain a 20% Elemental DMG Bonus for the corresponding absorbed element during its duration.</span> }],
      }
    },
  },
};
export default char;
