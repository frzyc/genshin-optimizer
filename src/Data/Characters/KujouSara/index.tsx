import card from './Character_Kujou_Sara_Card.jpg'
import thumb from './Character_Kujou_Sara_Thumb.png'
import c1 from './Constellation_Crow\'s_Eye.png'
import c2 from './Constellation_Dark_Wings.png'
import c3 from './Constellation_The_War_Within.png'
import c4 from './Constellation_Conclusive_Proof.png'
import c5 from './Constellation_Spellsinger.png'
import c6 from './Constellation_Sin_of_Pride.png'
import normal from './Talent_Tengu_Bowmanship.png'
import skill from './Talent_Tengu_Stormcall.png'
import burst from './Talent_Subjugation_Koukou_Sendou.png'
import passive1 from './Talent_Immovable_Will.png'
import passive2 from './Talent_Decorum.png'
import passive3 from './Talent_Land_Survey.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, normalDocSection, plungeDocSection, st, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { Typography } from '@mui/material'
const path = KeyPath<FormulaPathBase, any>().character.KujouSara
const tr = (strKey: string) => <Translate ns="char_KujouSara_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_KujouSara" key18={strKey} />
const conditionals: IConditionals = {
  e: { //Gengu StormCall
    name: charTr("skill.ambush"),
    stats: {
      modifiers: { atk: [path.skill.atkBonus()] },
    },
    fields: [{
      text: st("increase.atk"),
      formulaText: stats => <span>{data.skill.atkRatio[stats.tlvl.skill]}% {Stat.printStat("baseATK", stats, true)}</span>,
      formula: formula.skill.atkBonus
    },]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
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
          bowChargedDocSection(tr, formula, data, "electro"),
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
              formulaText: stats => basicDMGFormulaText(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
              formula: formula.skill.dmg,
              variant: stats => getTalentStatKeyVariant("skill", stats),
            }, {
              text: tr("skill.skillParams.2"),
              value: data.skill.duration,
              unit: "s"
            }, {
              text: tr("skill.skillParams.3"),
              value: data.skill.cd,
              unit: "s"
            }],
          conditional: conditionals.e,
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
            formulaText: stats => basicDMGFormulaText(data.burst.cluster[stats.tlvl.burst], stats, "burst"),
            formula: formula.burst.cluster,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.2"),
            value: data.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: data.burst.cost,
          }]
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
          fields: [{
            canShow: stats => stats.constellation >= 2,
            text: tr("skill.skillParams.0"),
            formulaText: stats => <span>0.3 * {data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} </span>,
            formula: formula.c2.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }]
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: stats => stats.constellation < 6 ? tr("constellation6.description") :
            <span>
              {tr("constellation6.description")}
              <Typography color="warning.main">This skill needs more theory-crafting before it can be implemented.</Typography>
            </span>,
        }],
      },
    },
  },
};
export default char;
