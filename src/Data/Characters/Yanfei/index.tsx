import card from './Character_Yanfei_Card.png'
import thumb from './Character_Yanfei_Thumb.png'
import c1 from './Constellation_The_Law_Knows_No_Kindness.png'
import c2 from './Constellation_Right_of_Final_Interpretation.png'
import c3 from './Constellation_Samadhi_Fire-Forged.png'
import c4 from './Constellation_Supreme_Amnesty.png'
import c5 from './Constellation_Abiding_Affidavit.png'
import c6 from './Constellation_Extra_Clause.png'
import normal from './Talent_Seal_of_Approval.png'
import skill from './Talent_Signed_Edict.png'
import burst from './Talent_Done_Deal.png'
import passive1 from './Talent_Proviso.png'
import passive2 from './Talent_Blazing_Eye.png'
import passive3 from './Talent_Encyclopedic_Expertise.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
const conditionals: IConditionals = {
  q: {
    name: <span>Brilliance</span>,
    stats: stats => ({ charged_dmg_: data.burst.dmg_[stats.tlvl.burst] }),
    fields: [{
      text: "Duration",
      value: "15s",
    }, {
      text: "Scarlet Seal Grant Interval",
      value: "1s"
    }]
  },
  p1: {
    canShow: stats => stats.ascension >= 1,
    name: <span>Consumes <b>Scarlet Seals</b> by using a Charged Attack</span>,
    stats: { pyro_dmg_: 5 },
    maxStack: stats => stats.constellation >= 6 ? 4 : 3,
    fields: [{
      text: "Duration",
      value: "6s",
    }]
  },
  c2: {
    canShow: stats => stats.constellation >= 2,
    name: "Against enemies below 50% HP",
    stats: { charged_critRate_: 20 }
  }
}
const char: ICharacterSheet = {
  name: "Yanfei",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Bestia Iustitia",
  titles: ["Wise Innocence", "Liyue Harbor's famed legal adviser"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: "Seal of Approval",
        img: normal,
        sections: [{
          text: <span><strong>Normal Attack</strong> Shoots fireballs that deal up to three counts of <span className="text-pyro">Pyro DMG</span>. When Yanfei's Normal Attacks hit enemies, they will grant her a single <b>Scarlet Seal</b>. Yanfei may possess a maximum of 3 <b>Scarlet Seals</b>, and each time this effect is triggered, the duration of currently possessed <b>Scarlet Seals</b> will refresh. Each <b>Scarlet Seal</b> will decrease Yanfei's Stamina consumption and will disappear when she leaves the field.</span>,
          fields: [...data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]} % {Stat.printStat(getTalentStatKey("normal", stats), stats)} </span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          })), {
            text: "Scarlet Seal Duration",
            value: "10s"
          }, {
            text: <span>Max number of <b>Scarlet Seals</b></span>,
            value: stats => stats.constellation >= 6 ? 4 : 3
          }]
        }, {
          text: <span><strong>Charged Attack</strong> Consumes Stamina and all <b>Scarlet Seals</b> before dealing <span className="text-pyro">AoE Pyro DMG</span> to the opponents after a short casting time. This Charged Attack's AoE and DMG will increase according to the amount of <b>Scarlet Seals</b> consumed.</span>,
          fields: [...data.charged.hitArr.map((percentArr, i) => ({
            canShow: stats => i < 4 || stats.constellation >= 6,
            text: `${i}-Seal DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]} % {Stat.printStat(getTalentStatKey("normal", stats), stats)} </span>,
            formula: formula.charged[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          })), {
            text: `Stamina Cost`,
            value: 50,
          }, {
            text: "Scarlet Seal Stamina Consumption Decrease",
            value: stats => stats.constellation >= 1 ? "15% + 10% per Seal" : "15% per Seal"
          }, {
            canShow: stats => stats.constellation >= 1,
            text: "Increases resistance against interruption during release."
          }]
        }, {
          text: <span><strong>Plunging Attack</strong> Gathering the power of Pyro, Yanfei plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-pyro">AoE Pyro DMG</span> upon impact with the ground.</span>,
          fields: [{
            text: `Plunge DMG`,
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.dmg,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: `Low Plunge DMG`,
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.low,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: `High Plunge DMG`,
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.high,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }]
        }],
      },
      skill: {
        name: "Signed Edict",
        img: skill,
        sections: [{
          text: <span>
            <p className="mb-2">Summons blistering flames that deal <span className="text-pyro">AoE Pyro DMG</span>.</p>
            <p className="mb-0">If this attack hits an enemy, Yanfei is granted the maximum number of <b>Scarlet Seals</b>.</p>
          </span>,
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "9s",
          },]
        }],
      },
      burst: {
        name: "Done Deal",
        img: burst,
        sections: [{
          text: <span>
            <p className="mb-2">Triggers a spray of intense flames that rush at nearby opponents, dealing <span className="text-pyro">AoE Pyro DMG</span>, granting Yanfei the maximum number of <b>Scarlet Seals</b>, and applying <b>Brilliance</b> to her.</p>
            <h6>Brilliance</h6>
            <p className="mb-0">Perodically grants Yanfei a <b>Scarlet Seal</b>. Increases the DMG of her Charged Attacks. The <b>Brilliance</b> effect stops when Yanfei leaves the field or dies.</p>
          </span>,
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Shield on Cast",
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)}</span>,
            formula: formula.constellation4.dmg,
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }]
          , conditional: conditionals.q
        }],
      },
      passive1: {
        name: "Proviso",
        img: passive1,
        sections: [{
          text: <span>When Yanfei consumes <b>Scarlet Seals</b> by using a Charged Attack, each <b>Scarlet Seal</b> will increase Yanfei's <span className="text-pyro">Pyro DMG Bonus</span> by 5%. This effect lasts for 6s. When a Charged Attack is used again during the effect's duration, it will dispel the previous effect.</span>,
          conditional: conditionals.p1
        }],
      },
      passive2: {
        name: "Blazing Eye",
        img: passive2,
        sections: [{
          text: <span>When Yanfei's Charged Attack deals a CRIT Hit to opponents, she will deal an additional instance of <span className="text-pyro">AoE Pyro DMG</span> equal to 80% of her ATK. This DMG counts as Charged Attack DMG.</span>,
          fields: [{
            text: "Crit Hit on Opponent",
            formulaText: stats => <span>80% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.passive2.dmg,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }]
        }],
      },
      passive3: {
        name: "	Encyclopedic Expertise",
        img: passive3,
        sections: [{ text: <span>Displays the location of nearby resources unique to Liyue on the mini-map.</span> }],
      },
      constellation1: {
        name: "The Law Knows No Kindness",
        img: c1,
        sections: [{ text: <span>When Yanfei uses her Charged Attacks, each existing <b>Scarlet Seal</b> additionally reduces the stamina cost of this Charged Attack by 10% and increases resistance against interruption during its release.</span> }],
      },
      constellation2: {
        name: "Right of Final Interpretation",
        img: c2,
        sections: [{
          text: <span>Increases Yanfei's Charged Attack CRIT rate by 20% against enemies below 50% HP.</span>,
          conditional: conditionals.c2
        }],
      },
      constellation3: {
        name: "Samadhi Fire-Forged",
        img: c3,
        sections: [{ text: <span>Increases the level of <b>Signed Edict</b> by 3. Maximum upgrade level is 15.</span> }],
        stats: { skillBoost: 3 }
      },
      constellation4: {
        name: "Supreme Amnesty",
        img: c4,
        sections: [{
          text: <span>
            <p className="mb-2">When <b>Done Deal</b> is used:</p>
            <p className="mb-0">Creates a shield which absorbes upto 45% of Yanfei's Max HP for 15s. This shield absorbes <span className="text-pyro">Pyro DMG</span> 250% more efficiently.</p>
          </span>,
          fields: [{
            canShow: stats => stats.constellation >= 4,
            text: <span className="text-pyro">Shield DMG Absorption</span>,
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("powShield_", stats)}) * (250% <span className="text-pyro">Pyro Absorption</span>)</span>,
            formula: formula.constellation4.shieldCryo,
            variant: "pyro"
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Shield DMG Absorption",
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("powShield_", stats)})</span>,
            formula: formula.constellation4.shield,
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Duration",
            value: "20s",
          },]
        }],
      },
      constellation5: {
        name: "Abiding Affidavit",
        img: c5,
        sections: [{ text: <span>Increases the level of <b>Done Deal</b> by 3. Maximum upgrade level is 15.</span> }],
        stats: { burstBoost: 3 }
      },
      constellation6: {
        name: "Extra Clause",
        img: c6,
        sections: [{ text: <span>Increases the maximum number of <b>Scarlet Seals</b> by 1.</span> }],
      }
    },
  },
};
export default char;
