import card from './Character_Lisa_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Infinite_Circuit.png'
import c2 from './Constellation_Electromagnetic_Field.png'
import c3 from './Constellation_Resonant_Thunder.png'
import c4 from './Constellation_Plasma_Eruption.png'
import c5 from './Constellation_Electrocute.png'
import c6 from './Constellation_Pulsating_Witch.png'
import normal from './Talent_Lightning_Touch.png'
import skill from './Talent_Violet_Arc.png'
import burst from './Talent_Lightning_Rose.png'
import passive1 from './Talent_Induced_Aftershock.png'
import passive2 from './Talent_Static_Electricity_Field.png'
import passive3 from './Talent_General_Pharmaceutics.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Lisa_gen" key18={strKey} />
const conditionals: IConditionals = {
  a4: { // StaticElectricityFieldDestiny
    canShow: stats => stats.ascension >= 4,
    name: "Opponents hit by Lightning Rose",
    stats: { enemyDEFRed_: 15 },
    fields: [{
      text: "Duration",
      value: "10s",
    }],
  },
  c2: { // ElectromagneticField
    canShow: stats => stats.constellation >= 2,
    name: "Holding Violent Arc",
    stats: { def_: 25 },
    fields: [{ text: "Increase resistance to interruption" }],
  },
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "electro",
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
          chargedDocSection(tr, formula, data, 50),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Press DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "No Stack Hold",
            formulaText: stats => <span>{data.skill.stack0[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stack0,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "1 Stack Hold",
            formulaText: stats => <span>{data.skill.stack1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stack1,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "2 Stack Hold",
            formulaText: stats => <span>{data.skill.stack2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stack2,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "3 Stack Hold",
            formulaText: stats => <span>{data.skill.stack3[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stack3,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Press CD",
            value: "1s",
          }, {
            text: "Hold CD",
            value: "12s",
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Summon DMG",
            formulaText: stats => <span>{data.burst.summon[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.summon,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Discharge DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Lightning Rose Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }, {
            canShow: stats => stats.ascension >= 4,
            text: <span>The DEF debuff is applied <strong>after</strong> the first lightning bolt.</span>
          }],
          conditional: conditionals.a4
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: conditionals.c2
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
