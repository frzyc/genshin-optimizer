import card from './Character_Yoimiya_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Agate_Ryuukin.png'
import c2 from './Constellation_A_Procession_of_Bonfires.png'
import c3 from './Constellation_Trickster\'s_Flare.png'
import c4 from './Constellation_Pyrotechnic_Professional.png'
import c5 from './Constellation_A_Summer_Festival\'s_Eve.png'
import c6 from './Constellation_Naganohara_Meteor_Swarm.png'
import normal from './Talent_Firework_Flare-Up.png'
import skill from './Talent_Niwabi_Fire-Dance.png'
import burst from './Talent_Ryuukin_Saxifrage.png'
import passive1 from './Talent_Tricks_of_the_Trouble-Maker.png'
import passive2 from './Talent_Summer_Night\'s_Dawn.png'
import passive3 from './Talent_Blazing_Match.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals, IConditionalValue } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { basicDMGFormulaText } from '../../../Util/FormulaTextUtil'
const tr = (strKey: string) => <Translate ns="char_Yoimiya_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_Yoimiya" key18={strKey} />
const conditionals: IConditionals = {
  a1: {
    canShow: stats => stats.ascension >= 1,
    name: tr("passive1.name"),
    maxStack: 10,
    stats: { pyro_dmg_: 2 },
  },
  c1: {
    canShow: stats => stats.constellation >= 1,
    name: charTr("c1"),
    stats: { atk_: 20, },
    fields: [{
      text: sgt("duration"),
      value: "20s"
    }]
  },
  c2: {
    canShow: stats => stats.constellation >= 2,
    name: charTr("c2"),
    stats: { pyro_dmg_: 25, },
    fields: [{
      text: sgt("duration"),
      value: "6s"
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
  elementKey: "pyro",
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
              text: <span>{sgt(`normal.hit${i + 1}`)} {(i === 0 || i === 3) ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          }, {
            text: tr("auto.fields.charged"),
            fields: [{
              text: tr("auto.skillParams.5"),
              formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.hit,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.6"),
              formulaText: stats => <span>{data.charged.full[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, "pyro"), stats)}</span>,
              formula: formula.charged.full,
              variant: stats => getTalentStatKeyVariant("charged", stats, "pyro"),
            }, {
              text: tr("auto.skillParams.7"),
              formulaText: stats => <span>{data.charged.kindling[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, "pyro"), stats)}</span>,
              formula: formula.charged.kindling,
              variant: stats => getTalentStatKeyVariant("charged", stats, "pyro"),
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
            ...data.normal.hitArr.map((percentArr, i) =>
            ({
              text: <span>{sgt(`normal.hit${i + 1}`)} {(i === 0 || i === 3) ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
              formulaText: stats => <span>{data.skill.dmg_[stats.tlvl.skill]}% * {percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats, "pyro"), stats)}</span>,
              formula: formula.skill[i],
              variant: stats => getTalentStatKeyVariant("normal", stats, "pyro"),
            })), {
              text: tr("skill.skillParams.1"),
              value: "10s"
            }, {
              text: tr("skill.skillParams.2"),
              value: "18s",
            }],
          conditional: conditionals.a1,
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
            formulaText: stats => basicDMGFormulaText(data.burst.exp[stats.tlvl.burst], stats, "burst"),
            formula: formula.burst.exp,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.2"),
            value: stats => 10 + (stats.constellation < 1 ? 0 : 4),
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: "15s",
          }, {
            text: tr("burst.skillParams.4"),
            value: 60,
          }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: charTr("p2"),
            value: stats => {
              const value = stats.conditionalValues?.character?.Yoimiya?.sheet?.talent?.a1 as IConditionalValue | undefined
              const [num] = value ?? [0]
              return 10 + num
            },
            unit: "%"
          }, {
            canShow: stats => stats.ascension >= 4,
            text: sgt("duration"),
            value: "15s",
          }]
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: conditionals.c1,
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
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          fields: [
            ...data.normal.hitArr.map((percentArr, i) =>
            ({
              canShow: stats => stats.constellation >= 6,
              text: <span>{sgt(`normal.hit${i + 1}`)} {(i === 0 || i === 2) ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
              formulaText: stats => <span>60% * {data.skill.dmg_[stats.tlvl.skill]}% * {percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats, "pyro"), stats)}</span>,
              formula: formula.c6[i],
              variant: stats => getTalentStatKeyVariant("normal", stats, "pyro"),
            }))]
        }],
      },
    },
  },
};
export default char;
