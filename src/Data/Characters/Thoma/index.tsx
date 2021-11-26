import card from './Character_Thoma_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_A_Comrade\'s_Duty.png'
import c2 from './Constellation_A_Subordinate\'s_Skills.png'
import c3 from './Constellation_Fortified_Resolve.png'
import c4 from './Constellation_Long-Term_Planning.png'
import c5 from './Constellation_Raging_Wildfire.png'
import c6 from './Constellation_Burning_Heart.png'
import normal from './Talent_Swiftshatter_Spear.png'
import skill from './Talent_Blazing_Blessing.png'
import burst from './Talent_Crimson_Ooyoroi.png'
import passive1 from './Talent_Imbricated_Armor.png'
import passive2 from './Talent_Flaming_Assault.png'
import passive3 from './Talent_Snap_and_Swing.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Thoma_gen" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "pyro",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talent: {
    formula,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [{
          text: tr("auto.fields.normal"),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: <span>{sgt(`normal.hit${i + 1}`)} {i === 2 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            text: sgt("charged.dmg"),
            formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.dmg,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: sgt("charged.stamina"),
            value: data.charged.stam,
          }]
        },
        plungeDocSection(tr, formula, data)],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: tr("skill.skillParams.0"),
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.1"),
            formulaText: stats => <span>( {data.skill.shieldHp_[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldHp[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.skill.shield,
          }, {
            text: <ColorText color="pyro">{tr("skill.skillParams.1")}</ColorText>,
            formulaText: stats => <span>( {data.skill.shieldHp_[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldHp[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="pyro">Pyro Absorption</ColorText>)</span>,
            formula: formula.skill.shieldPyro,
            variant: "pyro"
          }, {
            text: tr("skill.skillParams.2"),
            value: data.skill.duration,
          }, {
            text: tr("skill.skillParams.3"),
            formulaText: stats => <span>( {data.skill.maxShieldHp_[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.maxShieldHp[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.skill.maxShield,
          }, {
            text: <ColorText color="pyro">{tr("skill.skillParams.3")}</ColorText>,
            formulaText: stats => <span>( {data.skill.maxShieldHp_[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.maxShieldHp[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="pyro">Pyro Absorption</ColorText>)</span>,
            formula: formula.skill.maxShieldPyro,
            variant: "pyro"
          }, {
            text: tr("skill.skillParams.4"),
            value: data.skill.cd,
          },],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.0"),
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.ascension < 4,
            text: tr("burst.skillParams.1"),
            formulaText: stats => <span>{data.burst.dmgCollapse[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmgCollapse,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: tr("burst.skillParams.1"),
            formulaText: stats => <span>( {data.burst.dmgCollapse[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.passive2.hp_}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst.dmgCollapseA4,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.2"),
            formulaText: stats => <span>( {data.burst.shieldHp_[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.shieldHp[stats.tlvl.burst]} ) * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.burst.shield,
          }, {
            text: <ColorText color="pyro">{tr("burst.skillParams.2")}</ColorText>,
            formulaText: stats => <span>( {data.burst.shieldHp_[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.shieldHp[stats.tlvl.burst]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="cryo">Cryo Absorption</ColorText>)</span>,
            formula: formula.burst.shieldPyro,
            variant: "pyro"
          }, {
            text: tr("burst.skillParams.3"),
            value: stat => data.burst.shieldDuration + (stat.constellation >= 2 ? data.constellation2.duration : 0),
          }, {
            text: tr("burst.skillParams.4"),
            value: data.burst.duration,
          }, {
            text: tr("burst.skillParams.5"),
            value: data.burst.cd,
          }, {
            text: tr("burst.skillParams.6"),
            value: data.burst.cost,
          },],
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: { // Imbricated Armor
            key: "a1",
            canShow: stats => stats.ascension >= 1,
            name: <Translate ns="char_Thoma" key18="a1" />,
            maxStack: data.passive1.maxStack,
            stats: { shield_: data.passive1.shield_ },
            fields: [{
              text: sgt("duration"),
              value: data.passive1.duration
            }]
          },
        }],
      },
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, "skillBoost"),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, "burstBoost"),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: { // Burning Heart
            key: "c6",
            canShow: stats => stats.constellation >= 6,
            name: <span><Translate ns="char_Thoma" key18="c6" /></span>,
            stats: {
              normal_dmg_: data.constellation6.auto_,
              charged_dmg_: data.constellation6.auto_,
              plunging_dmg_: data.constellation6.auto_
            },
            fields: [{
              text: sgt("duration"),
              value: data.constellation6.duration
            }]
          }
        }],
      }
    },
  },
};
export default char;