import card from './Character_Kazuha_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Scarlet_Hills.png'
import c2 from './Constellation_Yamaarashi_Tailwind.png'
import c3 from './Constellation_Maple_Monogatari.png'
import c4 from './Constellation_Oozora_Genpou.png'
import c5 from './Constellation_Wisdom_of_Bansei.png'
import c6 from './Constellation_Crimson_Momiji.png'
import normal from './Talent_Garyuu_Bladework.png'
import skill from './Talent_Chihayaburu.png'
import burst from './Talent_Kazuha_Slash.png'
import passive1 from './Talent_Poetics_of_Fuubutsu.png'
import passive2 from './Talent_Soumon_Swordsmanship.png'
import passive3 from './Talent_Cloud_Strider.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { sgt, st, talentTemplate } from '../SheetUtil'
import ElementalData from '../../ElementalData'
import { absorbableEle } from '../dataUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { WeaponTypeKey } from '../../../Types/consts'

const path = KeyPath<FormulaPathBase, any>().character.KaedeharaKazuha
const tr = (strKey: string) => <Translate ns="char_KaedeharaKazuha_gen" key18={strKey} />
const conditionals: IConditionals = {
  q: { // Absorption
    name: st("eleAbsor"),
    states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
      name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
      fields: [{
        canShow: stats => {
          const value = stats.conditionalValues?.character?.KaedeharaKazuha?.sheet?.talent?.q as IConditionalValue | undefined
          if (!value) return false
          const [num, condEleKey] = value
          if (!num || condEleKey !== eleKey) return false
          return true
        },
        text: st("absorDot"),
        formulaText: stats => <span>{data.burst.add[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
        formula: formula.burst[eleKey],
        variant: eleKey
      }],
    }]))
  },
  a1: {// Soumon Swordsmanship
    canShow: stats => stats.ascension >= 1,
    name: st("eleAbsor"),
    states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
      name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
      fields: [{
        canShow: stats => {
          const value = stats.conditionalValues?.character?.KaedeharaKazuha?.sheet?.talent?.a1 as IConditionalValue | undefined
          if (!value) return false
          const [num, condEleKey] = value
          if (!num || condEleKey !== eleKey) return false
          return true
        },
        text: sgt("addEleDMG"),
        formulaText: stats => <span>200% {Stat.printStat(getTalentStatKey("plunging", stats, eleKey), stats)}</span>,
        formula: formula.passive1[eleKey],
        variant: eleKey
      }],
    }]))
  },
  a4: { // Poetics of Fuubutsu
    canShow: stats => stats.ascension >= 4,
    name: <TransWrapper ns="char_KaedeharaKazuha" key18="a4.name" />,
    states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
      name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
      stats: { modifiers: { [`${eleKey}_dmg_`]: [path.passive2.bonus()] } },//TODO: party buff modifier
      fields: [{
        text: <TransWrapper ns="char_KaedeharaKazuha" key18="a4.bonus" />,
        formulaText: stats => <span>0.04% {Stat.printStat("eleMas", stats, true)}</span>,
        formula: formula.passive2.bonus,
        fixed: 1,
        unit: "%"
      }, {
        text: sgt("duration"),
        value: "8s",
      }]
    }]))
  },
  c2: {
    canShow: stats => stats.constellation >= 2,
    name: <TransWrapper ns="char_KaedeharaKazuha" key18="c2" />,
    stats: { eleMas: 200 }//TODO: party buff
  },
  c6: {//Crimson Momiji
    canShow: stats => stats.constellation >= 6,
    name: <TransWrapper ns="char_KaedeharaKazuha" key18="c6.after" />,
    stats: {
      modifiers: {
        normal_dmg_: [path.constellation6.bonus()],
        charged_dmg_: [path.constellation6.bonus()],
        plunging_dmg_: [path.constellation6.bonus()],
      },
      infusionSelf: "anemo",
    },
    fields: [{
      text: <TransWrapper ns="char_KaedeharaKazuha" key18="c6.bonus" />,
      formulaText: stats => <span>0.2% {Stat.printStat("eleMas", stats, true)}</span>,
      formula: formula.constellation6.bonus,
      fixed: 1,
      unit: "%"
    }, {
      text: sgt("duration"),
      value: "5s",
    }]
  }
}

const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "anemo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [{
          text: tr("auto.fields.normal"),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: <span>{sgt(`normal.hit${i + (i < 5 ? 1 : 0)}`)} {i === 2 ? "(1)" : i === 3 ? "(2)" : i === 5 ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 3 }} />)</span> : ""}</span>,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            text: sgt(`normal.hit${1}`),
            formulaText: stats => <span>{data.charged.hit1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit1,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: sgt(`normal.hit${2}`),
            formulaText: stats => <span>{data.charged.hit2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit2,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: sgt("charged.stamina"),
            value: 20,
          }]
        }, {
          text: tr("auto.fields.plunging"),
          fields: [{
            text: sgt(`plunging.dmg`),
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.dmg,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: sgt("plunging.low"),
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.low,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: sgt("plunging.high"),
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.high,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }]
        }],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: sgt("press.dmg"),
            formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]} % {Stat.printStat(getTalentStatKey("skill", stats), stats)} </span>,
            formula: formula.skill.press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: sgt("press.cd"),
            value: stat => stat.constellation >= 1 ? "6s - 10%" : "6s",
          }, {
            text: sgt("hold.dmg"),
            formulaText: stats => <span>{data.skill.hold[stats.tlvl.skill]} % {Stat.printStat(getTalentStatKey("skill", stats), stats)} </span>,
            formula: formula.skill.hold,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: sgt("hold.cd"),
            value: stat => stat.constellation >= 1 ? "9s - 10%" : "9s",
          }, {
            canShow: stat => stat.constellation >= 1,
            text: <TransWrapper ns="char_KaedeharaKazuha" key18="c1" />,
          }]
        }, {
          fields: [{
            text: sgt(`plunging.dmg`),
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.skill.pdmg,
            variant: stats => getTalentStatKeyVariant("plunging", stats, "anemo"),
          }, {
            text: sgt("plunging.low"),
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.skill.plow,
            variant: stats => getTalentStatKeyVariant("plunging", stats, "anemo"),
          }, {
            text: sgt("plunging.high"),
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.skill.phigh,
            variant: stats => getTalentStatKeyVariant("plunging", stats, "anemo"),
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.slashdmg"),
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]} % {Stat.printStat(getTalentStatKey("burst", stats), stats)} </span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: sgt(`dot`),
            formulaText: stats => <span>{data.burst.dot[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dot,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: sgt("duration"),
            value: "8s",
          }, {
            text: sgt("cd"),
            value: "15s",
          }, {
            text: sgt("energyCost"),
            value: 60,
          }]
        }, {
          conditional: conditionals.q
        }, {
          conditional: conditionals.c2
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.a1
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
        }],
      },
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{ text: tr("passive3.description"), }],
        stats: { staminaSprintDec_: 20 }
      },
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6
        }]
      }
    }
  },
};
export default char;
