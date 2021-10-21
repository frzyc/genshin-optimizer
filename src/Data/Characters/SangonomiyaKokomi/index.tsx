import card from './Character_Sangonomiya_Kokomi_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_At_Water\'s_Edge.png'
import c2 from './Constellation_The_Clouds_Like_Waves_Rippling.png'
import c3 from './Constellation_The_Moon,_A_Ship_O\'er_the_Seas.png'
import c4 from './Constellation_The_Moon_Overlooks_the_Waters.png'
import c5 from './Constellation_All_Streams_Flow_to_the_Sea.png'
import c6 from './Constellation_Sango_Isshin.png'
import normal from './Talent_The_Shape_of_Water.png'
import skill from './Talent_Kurage\'s_Oath.png'
import burst from './Talent_Nereid\'s_Ascension.png'
import sprint from './Talent_Flawless_Strategy.png'
import passive1 from './Talent_Tamanooya\'s_Casket.png'
import passive2 from './Talent_Song_of_Pearls.png'
import passive3 from './Talent_Princess_of_Watatsumi.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { plungeDocSection, sgt, st, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
import { BasicStats } from '../../../Types/stats'
const tr = (strKey: string) => <Translate ns="char_SangonomiyaKokomi_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_SangonomiyaKokomi" key18={strKey} />
const conditionals: IConditionals = {
  b: { //burst
    name: charTr("burst"),
    fields: [{
      text: tr("burst.skillParams.4"),
      canShow: stats => !c2On(stats),
      formulaText: stats => <span>( {data.burst.heal_[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.heal[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.burst.regen,
      variant: "success"
    }, {
      text: tr("burst.skillParams.4"),
      canShow: stats => c2On(stats),
      formulaText: stats => <span>( ( {data.burst.heal_[stats.tlvl.burst]}% + {data.c2.nc_heal_}% ) * {Stat.printStat("finalHP", stats)} + {data.burst.heal[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
      formula: formula.burst.regenC2,
      variant: "success"
    },]
  },
  c2: {
    canShow: stats => stats.constellation >= 2,
    name: charTr("c2"),
  },
  c6: {
    canShow: stats => stats.constellation >= 6 && burstOn(stats),
    name: charTr("c6"),
    stats: {
      hydro_dmg_: data.c6.hydro_
    },
    fields: [{
      text: sgt("duration"),
      value: data.c6.duration,
      unit: "s"
    }]
  }
}
function burstOn(stats) {
  const value = stats.conditionalValues?.character?.SangonomiyaKokomi?.sheet?.talent?.b as IConditionalValue | undefined
  if (!value) return false
  const [num,] = value
  if (!num) return false
  return true
}
function c2On(stats) {
  if (stats.constellation < 2) return false
  const value = stats.conditionalValues?.character?.SangonomiyaKokomi?.sheet?.talent?.c2 as IConditionalValue | undefined
  if (!value) return false
  const [num,] = value
  if (!num) return false
  return true
}
function ncText(percent: number, hpPercent: number, stats: BasicStats, skillKey: string) {
  const hasA4 = stats.ascension >= 4
  const hpText = hasA4 ? <span>( {hpPercent}% + {data.p2.heal_ratio}% * {Stat.printStat("heal_", stats)})</span> : `${hpPercent}%`
  return <span>( {percent}% {Stat.printStat("finalATK", stats)} + {hpText} * {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey(skillKey, stats) + "_multi", stats)}</span>
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "hydro",
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
            text: tr(`auto.fields.normal`),
            fields: data.normal.hitArr.flatMap((percentArr, i) => [{
              text: sgt(`normal.hit${i + 1}`),
              canShow: stats => !burstOn(stats),
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }, {
              text: sgt(`normal.hit${i + 1}`),
              canShow: stats => burstOn(stats),
              formulaText: stats => ncText(percentArr[stats.tlvl.auto], data.burst.nBonus[stats.tlvl.burst], stats, "normal"),
              formula: formula.normal[`${i}HP`],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }])
          },
          {
            text: tr(`auto.fields.charged`),
            fields: [{
              text: sgt(`charged.dmg`),
              canShow: stats => !burstOn(stats),
              formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.dmg,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: sgt(`charged.dmg`),
              canShow: stats => burstOn(stats),
              formulaText: stats => ncText(data.charged.dmg[stats.tlvl.auto], data.burst.cBonus[stats.tlvl.burst], stats, "charged"),
              formula: formula.charged.dmgHP,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: sgt("charged.stamina"),
              value: data.charged.stam,
            }]
          },
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            {
              text: tr("skill.skillParams.0"),
              canShow: stats => !c2On(stats),
              formulaText: stats => <span>( {data.skill.heal_[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.heal[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
              formula: formula.skill.regen,
              variant: "success"
            }, {
              text: tr("skill.skillParams.0"),
              canShow: stats => c2On(stats),
              formulaText: stats => <span>( ( {data.skill.heal_[stats.tlvl.skill]}% + {data.c2.s_heal_}% ) * {Stat.printStat("finalHP", stats)} + {data.skill.heal[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
              formula: formula.skill.regenC2,
              variant: "success"
            }, {
              text: tr("skill.skillParams.1"),
              canShow: stats => !burstOn(stats),
              formulaText: stats => basicDMGFormulaText(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
              formula: formula.skill.dmg,
              variant: stats => getTalentStatKeyVariant("skill", stats),
            }, {
              text: tr("skill.skillParams.1"),
              canShow: stats => burstOn(stats),
              formulaText: stats => <span>( {data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + {data.burst.sBonus[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
              formula: formula.skill.dmgHP,
              variant: stats => getTalentStatKeyVariant("skill", stats),
            }, {
              text: tr("skill.skillParams.2"),
              value: data.skill.duration,
              unit: "s"
            }, {
              text: tr("skill.skillParams.3"),
              value: data.skill.cd,
              unit: "s"
            }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.0"),
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} * {Stat.printStat(getTalentStatKey("burst", stats), stats)} </span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.5"),
            value: data.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.6"),
            value: data.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.7"),
            value: data.burst.cost,
          }],
          conditional: conditionals.b
        }],
      },
      passive: {
        name: tr("passive.name"),
        img: sprint,
        stats: {
          critRate_: -100,
          heal_: 25,
        },
        sections: [{
          text: tr("passive.description"),
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          fields: [{
            canShow: stats => stats.constellation >= 1,
            text: st("dmg"),
            formulaText: stats => <span>{data.c1.hp_}% * {Stat.printStat("finalHP", stats)} * {Stat.printStat(getTalentStatKey("elemental", stats) + "_multi", stats)} </span>,
            formula: formula.c1.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }]
        }],
      },
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: conditionals.c2
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        stats: stats => stats.constellation >= 4 && burstOn(stats) && {
          atkSPD_: 10
        },
        sections: [{
          text: tr("constellation4.description"),
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6
        }],
      },
    },
  },
};
export default char;
