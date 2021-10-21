import card from './Character_Diona_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_A_Lingering_Flavor.png'
import c2 from './Constellation_Shaken,_Not_Purred.png'
import c3 from './Constellation_A-Another_Round_.png'
import c4 from './Constellation_Wine_Industry_Slayer.png'
import c5 from './Constellation_Double_Shot,_On_The_Rocks.png'
import c6 from './Constellation_Cat\'s_Tail_Closing_Time.png'
import normal from './Talent_Kätzlein_Style.png'
import skill from './Talent_Icy_Paws.png'
import burst from './Talent_Signature_Mix.png'
import passive1 from './Talent_Cat\'s_Tail_Secret_Menu.png'
import passive2 from './Talent_Drunkards\'_Farce.png'
import passive3 from './Talent_Complimentary_Bar_Food.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Diona_gen" key18={strKey} />
const conditionals: IConditionals = {
  c4: { // IcyPawsShield
    canShow: stats => stats.constellation >= 4,
    name: "Characters Shielded",
    stats: {
      moveSPD_: 10,
      staminaDec_: 10
    },
  },
  c6n: { // CatsTailClosingTimeBelow50 (near)
    canShow: stats => stats.constellation >= 6,
    name: "Characters within radius below or equal 50% HP",
    stats: { incHeal_: 30 },
  },
  c6f: { // TailClosingTimeAbove50 (far)
    canShow: stats => stats.constellation >= 6,
    name: "Characters within radius above 50% HP",
    stats: { eleMas: 200 },
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "cryo",
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
          normalDocSection(tr, formula, data),
          bowChargedDocSection(tr, formula, data, "cryo"),
          plungeDocSection(tr, formula, data)
        ]
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: <ColorText color="cryo">Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>( {data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="cryo">Cryo Absorption</ColorText>){stats.constellation >= 2 ? " * 115%" : ""}</span>,
            formula: formula.skill.shieldCryo,
            variant: "cryo"
          }, {
            text: "Shield DMG Absorption",
            formulaText: stats => <span>( {data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}){stats.constellation >= 2 ? " * 115%" : ""}</span>,
            formula: formula.skill.shield,
          }, {
            text: <ColorText color="cryo">Hold Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>( {data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="cryo">Cryo Absorption</ColorText>) * 175%{stats.constellation >= 2 ? " * 115%" : ""}</span>,
            formula: formula.skill.shieldHoldCryo,
            variant: "cryo"
          }, {
            text: "Hold Shield DMG Absorption",
            formulaText: stats => <span>( {data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * 175%{stats.constellation >= 2 ? " * 115%" : ""}</span>,
            formula: formula.skill.shieldHold,
          }, {
            text: "Icy Paw DMG",
            formulaText: stats => <span>{data.skill.dmgPerPaw[stats.tlvl.skill]}%{stats.constellation >= 2 ? " + 15%" : ""} {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Duration per Paw",
            value: stats => `${data.skill.durationPerPaw[stats.tlvl.skill]}s`,
          }, {
            text: "Press CD",
            value: "6s",
          }, {
            text: "Hold CD",
            value: "15s",
          }],
          conditional: conditionals.c4
        }]
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Continuous Field DMG",
            formulaText: stats => <span>{data.burst.continuousDmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.continuousDmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "HP Regeneration Over Time",
            formulaText: stats => <span>( {data.burst.hpPercent[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.hpFlat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.regen,
            variant: "success",
          }, {
            text: "Duration",
            value: "12s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }],
          conditional: conditionals.c6n
        }, {
          conditional: conditionals.c6f
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),//TODO: enemy atk decrease
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{ text: tr("constellation2.description"), }],
        stats: stats => stats.constellation >= 2 && { skill_dmg_: 15 }
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
