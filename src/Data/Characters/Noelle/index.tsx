import card from './Character_Noelle_Card.jpg'
import thumb from './Character_Noelle_Thumb.png'
import c1 from './Constellation_I_Got_Your_Back.png'
import c2 from './Constellation_Combat_Maid.png'
import c3 from './Constellation_Invulnerable_Maid.png'
import c4 from './Constellation_To_Be_Cleaned.png'
import c5 from './Constellation_Favonius_Sweeper_Master.png'
import c6 from './Constellation_Must_Be_Spotless.png'
import normal from './Talent_Favonius_Bladework_-_Maid.png'
import skill from './Talent_Breastplate.png'
import burst from './Talent_Sweeping_Time.png'
import passive1 from './Talent_Devotion.png'
import passive2 from './Talent_Nice_and_Clean.png'
import passive3 from './Talent_Maid\'s_Knighthood.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { claymoreChargedDocSection, normalDocSection, plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
const tr = (strKey: string) => <Translate ns="char_noelle_gen" key18={strKey} />
const noelle = (strKey: string) => <TransWrapper ns="char_noelle" key18={strKey} />
const conditionals: IConditionals = {
  q: { // Sweeping Time
    name: tr("burst.name"),
    maxStack: 1,
    stats: stats => ({
      modifiers: { finalATK: { finalDEF: (data.burst.bonus[stats.tlvl.burst] + (stats.constellation >= 6 ? 50 : 0)) / 100 } },
      infusionSelf: "geo",
    }),
    fields: [{ text: noelle("qlarger") }]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: tr("constellationName"),
  titles: ["Chivalric Blossom", "Maid of Favonius"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  conditionals,
  talent: {
    auto: {
      name: tr("auto.name"),
      img: normal,
      document: [
        normalDocSection(tr, formula, data),
        claymoreChargedDocSection(tr, formula, data),
        plungeDocSection(tr, formula, data)
      ],
    },
    skill: {
      name: tr("skill.name"),
      img: skill,
      document: [{
        text: tr("skill.description"),
        fields: [{
          text: sgt("skillDMG"),
          formulaText: stats => <span>{data.skill.skill_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.skill.skill_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: sgt("dmgAbsorption"),
          formulaText: stats => <span>( {data.skill.shield_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.shield_flat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("powShield_", stats)}) * 150% All DMG Absorption</span>,
          formula: formula.skill.shield,
        }, {
          text: sgt("healing"),
          formulaText: stats => <span>( {data.skill.heal_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.heal_flat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.heal,
          variant: "success"
        }, {
          text: tr("skill.triggerChance"),
          value: stats => <span>{data.skill.heal_trigger[stats.tlvl.skill]}% {stats.constellation >= 1 ? noelle("c1chance") : ""}</span>,
        }, {
          text: sgt("healing"),
          value: "12s",
        }, {
          text: sgt("cd"),
          value: stats => stats.ascension > 4 ? noelle("p4cd") : "24s",
        }],
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      document: [{
        text: tr("burst.description"),
        fields: [{
          text: sgt("burstDMG"),
          formulaText: stats => <span>{data.burst.burst_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.burst_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: sgt("skillDMG"),
          formulaText: stats => <span>{data.burst.skill_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.skill_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: tr("burst.atkBonus"),
          formulaText: stats => <span>{data.burst.bonus[stats.tlvl.burst]}% {stats.constellation >= 6 ? "+50% " : ""}{Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.burst.bonus,
        }, {
          text: sgt("duration"),
          value: stats => stats.constellation >= 6 ? noelle("c6duration") : "15s",
        }, {
          text: sgt("cd"),
          value: "15s",
        }, {
          text: sgt("energyCost"),
          value: 60,
        }],
        conditional: conditionals.q
      }],
    },
    passive1: {
      name: tr("passive1.name"),
      img: passive1,
      document: [{
        text: tr("passive1.description"),
        fields: [{
          canShow: stats => stats.ascension >= 1,
          text: sgt("dmgAbsorption"),
          formulaText: stats => <span>400% {Stat.printStat("finalDEF", stats)} * (100% + {Stat.printStat("powShield_", stats)}) * 150% All DMG Absorption</span>,
          formula: formula.passive1.hp,
        }, {
          canShow: stats => stats.ascension >= 1,
          text: sgt("cd"),
          value: "60s",
        }]
      }],
    },
    passive2: talentTemplate("passive2", tr, passive2),
    passive3: talentTemplate("passive3", tr, passive3),
    constellation1: talentTemplate("constellation1", tr, c1),
    constellation2: {
      name: tr("constellation2.name"),
      img: c2,
      document: [{ text: tr("constellation2.description"), }],
      stats: {
        charged_dmg_: 15,
        staminaChargedDec_: 20,
      }
    },
    constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
    constellation4: {
      name: tr("constellation4.name"),
      img: c4,
      document: [{
        text: tr("constellation4.description"),
        fields: [{
          canShow: stats => stats.constellation >= 4,
          text: "Breastplate Shatter DMG",
          formulaText: stats => <span>400% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
          formula: formula.constellation4.dmg,
          variant: stats => getTalentStatKeyVariant("elemental", stats),
        }]
      }]
    },
    constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
    constellation6: talentTemplate("constellation6", tr, c6),
  }
};
export default char;
