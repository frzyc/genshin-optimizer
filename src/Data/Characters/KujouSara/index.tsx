import card from './Character_Kujou_Sara_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './constellation1.png'
import c2 from './constellation2.png'
import c3 from './constellation3.png'
import c4 from './constellation4.png'
import c5 from './constellation5.png'
import c6 from './constellation6.png'
import skill from './skill.png'
import burst from './burst.png'
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, conditionalHeader, normalDocSection, normalSrc, plungeDocSection, st, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { Typography } from '@mui/material'
const path = KeyPath<FormulaPathBase, any>().character.KujouSara
const tr = (strKey: string) => <Translate ns="char_KujouSara_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_KujouSara" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
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
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
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
          conditional: { //Gengu StormCall
            key: "e",
            partyBuff: "partyActive",
            header: conditionalHeader("skill", tr, skill),
            description: tr("skill.description"),
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
      constellation3: talentTemplate("constellation3", tr, c3, "burstBoost"),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, "skillBoost"),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: stats => stats.constellation < 6 ? tr("constellation6.description") :
            <span>
              {tr("constellation6.description")}
              <Typography color="warning.main">This skill needs more system changes before it can be implemented.</Typography>
            </span>,
        }],
      },
    },
  },
};
export default char;
