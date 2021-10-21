import card from './Character_Razor_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Wolf\'s_Instinct.png'
import c2 from './Constellation_Suppression.png'
import c3 from './Constellation_Soul_Companion.png'
import c4 from './Constellation_Bite.png'
import c5 from './Constellation_Sharpened_Claws.png'
import c6 from './Constellation_Lupus_Fulguris.png'
import normal from './Talent_Steel_Fang.png'
import skill from './Talent_Claw_and_Thunder.png'
import burst from './Talent_Lightning_Fang.png'
import passive1 from './Talent_Awakening.png'
import passive2 from './Talent_Hunger.png'
import passive3 from './Talent_Wolvensprint.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant, } from "../../../Build/Build"
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { claymoreChargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { Typography } from '@mui/material'
const tr = (strKey: string) => <Translate ns="char_Razor_gen" key18={strKey} />
const conditionals: IConditionals = {
  e: { // ElectroSigil
    name: "Electro Sigil",
    maxStack: 3,
    stats: { enerRech_: 20 },
  },
  q: { // LightningFang
    name: "Lightning Fang",
    stats: stats => ({
      electro_res_: 80,
      atkSPD_: data.burst.atkspd[stats.tlvl.burst],
    }),
    fields: [{
      text: "Increases resistance to interruption"
    }]
  },
  a4: { // Hunger
    canShow: stats => stats.ascension >= 4,
    name: "Energy < 50%",
    stats: { enerRech_: 30 },
  },
  c1: { // WolfsInstinct
    canShow: stats => stats.constellation >= 1,
    name: "Pickup Elemental Particle",
    stats: { dmg_: 10 },
    fields: [{
      text: "Duration",
      value: "8s",
    }],
  },
  c2: { // Suppression
    canShow: stats => stats.constellation >= 2,
    name: "Enemy with <30% HP",
    stats: { critRate_: 10 },
  },
  c4: { // Bite
    canShow: stats => stats.constellation >= 4,
    name: <span>Casting <b>Claw and Thunder</b> (Press)</span>,
    stats: { enemyDEFRed_: 15 },
    fields: [{
      text: "Duration",
      value: "7s",
    }],
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
        sections: [
          normalDocSection(tr, formula, data),
          claymoreChargedDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Press DMG",
            formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Press CD",
            value: stats => 6 * (stats.ascension >= 1 ? 0.82 : 1) + "s",
          }, {
            text: "Hold DMG",
            formulaText: stats => <span>{data.skill.hold[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hold,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Hold CD",
            value: stats => 10 * (stats.ascension >= 1 ? 0.82 : 1) + "s",
          }, {
            text: "Energy Recharge Bonus",
            value: "20% per Electro Sigil",
          }, {
            text: "Hold Energy Generated",
            value: "5 per Electro Sigil Absorbed",
          }, {
            text: "Electro Sigil Duration",
            value: "18s",
          }],
          conditional: conditionals.e
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Elemental Burst DMG",
            formulaText: stats => <span>{data.burst.summon[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.summon,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          },
          ...data.normal.hitArr.map((percentArr, i) => ({
            text: `Companion ${i + 1}-Hit DMG`,
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% * {percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst[i],
            variant: stats => getTalentStatKeyVariant("burst", stats),
          })),
          {
            text: "Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }],
        }, {
          text: (
            <TransWrapper ns="char_Razor" key18="fullBurstDMG.text">
              <Typography variant="h6"><strong>Full Elemental Burst DMG</strong></Typography>
              <Typography>This calculates the combined damage from Razor's normal attacks during his Elemental Burst.
                It simply sums the Companion X-Hit DMG with the corresponding X-Hit DMG of the normal attack which triggers it.</Typography>
            </TransWrapper>
          ),
          fields: data.normal.hitArr.map((percentArr, i) => ({
            text: <TransWrapper ns="char_Razor" key18="fullBurstDMG.label" values={{ hitNum: i + 1 }} />,
            formulaText: stats => <span>
              {percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}
              + {data.burst.dmg[stats.tlvl.burst]}% * {percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst[`c${i}`],
          })),
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: conditionals.c1
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
        sections: [{
          text: tr("constellation4.description"),
          conditional: conditionals.c4
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          fields: [{
            canShow: stats => stats.constellation >= 6,
            text: "Lupus Fulguris DMG",
            formulaText: stats => <span>100% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation6.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }, {
            canShow: stats => stats.constellation >= 6,
            text: "Electro Sigils per proc",
            value: 1,
          }, {
            canShow: stats => stats.constellation >= 6,
            text: "Cooldown",
            value: `10s`,
          }],
        }],
      },
    },
  },
};
export default char;
