import card from './Character_Sayu_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Multi-Task_no_Jutsu.png'
import c2 from './Constellation_Egress_Prep.png'
import c3 from './Constellation_Eh,_the_Bunshin_Can_Handle_It.png'
import c4 from './Constellation_Skiving_New_and_Improved.png'
import c5 from './Constellation_Speed_Comes_First.png'
import c6 from './Constellation_Sleep_O\'Clock.png'
import normal from './Talent_Shuumatsuban_Ninja_Blade.png'
import skill from './Talent_Yoohoo_Art_Fuuin_Dash.png'
import burst from './Talent_Yoohoo_Art_Mujina_Flurry.png'
import passive1 from './Talent_Someone_More_Capable.png'
import passive2 from './Talent_No_Work_Today.png'
import passive3 from './Talent_Yoohoo_Art_Silencer\'s_Secret.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { claymoreChargedDocSection, plungeDocSection, sgt, st, talentTemplate } from '../SheetUtil'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { absorbableEle } from '../dataUtil'
import ElementalData from '../../ElementalData'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Sayu_gen" key18={strKey} />
const conditionals: IConditionals = {
  e: { // Absorption
    name: st("eleAbsor"),
    states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
      name: <span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span>,
      fields: [{
        canShow: stats => {
          const value = stats.conditionalValues?.character?.Sayu?.sheet?.talent?.e as IConditionalValue | undefined
          if (!value) return false
          const [num, condEleKey] = value
          if (!num || condEleKey !== eleKey) return false
          return true
        },
        text: tr("skill.skillParams.3"),
        formulaText: stats => basicDMGFormulaText(data.skill.ele_dmg[stats.tlvl.skill], stats, "skill"),
        formula: formula.skill[eleKey],
        variant: eleKey
      }, {
        canShow: stats => {
          const value = stats.conditionalValues?.character?.Sayu?.sheet?.talent?.e as IConditionalValue | undefined
          if (!value) return false
          const [num, condEleKey] = value
          if (!num || condEleKey !== eleKey) return false
          return true
        },
        text: tr("skill.skillParams.4"),
        formulaText: stats => {
          const skillPercent = data.skill.ele_kick[stats.tlvl.skill]
          const basic = () => basicDMGFormulaText(skillPercent, stats, "skill", eleKey)
          if (stats.constellation < 2) return basic()
          const value = stats.conditionalValues?.character?.Sayu?.sheet?.talent?.c2 as IConditionalValue | undefined
          const [num] = value ?? [0]
          if (!num) return basic()

          const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
          return <span> {skillPercent} % {Stat.printStat("finalATK", stats)} {hitModeMultiKey ? <span>* {Stat.printStat(hitModeMultiKey, stats)} </span> : null}* ( {Stat.printStat(`${eleKey}_skill_hit_base_multi`, stats)} + 3.3% * <ColorText color="info">{num}</ColorText> stacks ) * {Stat.printStat("enemyLevel_multi", stats)} * {Stat.printStat(`${eleKey}_enemyRes_multi`, stats)}</span >
        },
        formula: formula.skill[`${eleKey}_kick`],
        variant: eleKey
      }],
    }]))
  },
  c2: {
    name: "Every 0.5 in Fuufuu Windwheeel state",
    maxStack: 20,
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
  gender: "F",
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
        sections: [
          {
            text: tr("auto.fields.normal"),
            fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: <span>{sgt(`normal.hit${i + 1}`)} {i === 2 ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          claymoreChargedDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: tr("skill.skillParams.0"),
            formulaText: stats => basicDMGFormulaText(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.1"),
            formulaText: stats => {
              const skillPercent = data.skill.kick_press[stats.tlvl.skill]
              if (stats.constellation < 2) return basicDMGFormulaText(skillPercent, stats, "skill")
              const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
              return <span> {skillPercent} % {Stat.printStat("finalATK", stats)} {hitModeMultiKey ? <span>* {Stat.printStat(hitModeMultiKey, stats)} </span> : null}* ( {Stat.printStat("anemo_skill_hit_base_multi", stats)} + 3.3% ) * {Stat.printStat("enemyLevel_multi", stats)} * {Stat.printStat("anemo_enemyRes_multi", stats)}</span >
            },
            formula: formula.skill.kick_press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.2"),
            formulaText: stats => {
              const skillPercent = data.skill.kick_hold[stats.tlvl.skill]
              const basic = () => basicDMGFormulaText(skillPercent, stats, "skill")
              if (stats.constellation < 2) return basic()
              const value = stats.conditionalValues?.character?.Sayu?.sheet?.talent?.c2 as IConditionalValue | undefined
              const [num] = value ?? [0]
              if (!num) return basic()

              const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
              return <span> {skillPercent} % {Stat.printStat("finalATK", stats)} {hitModeMultiKey ? <span>* {Stat.printStat(hitModeMultiKey, stats)} </span> : null}* ( {Stat.printStat("anemo_skill_hit_base_multi", stats)} + 3.3% * <ColorText color="info">{num}</ColorText> stacks ) * {Stat.printStat("enemyLevel_multi", stats)} * {Stat.printStat("anemo_enemyRes_multi", stats)}</span>
            },
            formula: formula.skill.kick_hold,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.5"),
            value: "10s"
          }, {
            text: tr("skill.skillParams.6"),
            value: "6s ~ 11s"
          }],
          conditional: conditionals.e
        }, {
          conditional: conditionals.c2
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.0"),
            formulaText: stats => basicDMGFormulaText(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.1"),
            formulaText: stats => <span>( {data.burst.heal_[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.heal[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.heal,
            variant: "success",
          }, {
            text: tr("burst.skillParams.2"),
            formulaText: stats => {
              if (stats.constellation < 6) return basicDMGFormulaText(data.burst.muji_dmg[stats.tlvl.burst], stats, "burst")
              else return <span>( {data.burst.muji_dmg[stats.tlvl.burst]}% + min( 400%, 0.2% {Stat.printStat("eleMas", stats)} )) * {Stat.printStat(getTalentStatKey("burst", stats), stats)} </span>
            },
            formula: formula.burst.muji_dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.3"),
            formulaText: stats => {
              if (stats.constellation < 6) return <span>( {data.burst.muji_heal_[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.muji_heal[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>
              else return <span>( {data.burst.muji_heal_[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.muji_heal[stats.tlvl.burst]} + 3 * {Stat.printStat("eleMas", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>
            },
            formula: formula.burst.muji_heal,
            variant: "success",
          }, {
            text: tr("burst.skillParams.4"),
            value: "12s",
          }, {
            text: tr("burst.skillParams.5"),
            value: "20",
          }, {
            text: tr("burst.skillParams.6"),
            value: 80,
          }]
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            text: sgt("healing"),
            formulaText: stats => <span>( 300 + 1.2 * {Stat.printStat("eleMas", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.passive1.heal,
            variant: "success",
          }, {
            canShow: stats => stats.ascension >= 1,
            text: sgt("cd"),
            value: "2s",
          }]
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            text: sgt("healing"),
            formulaText: stats => <span>20% * ( {data.burst.muji_heal_[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.muji_heal[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.passive2.heal,
            variant: "success",
          }]
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
