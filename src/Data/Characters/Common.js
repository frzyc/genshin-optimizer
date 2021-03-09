
export const basicNormal = (talentPercent, text = "TEMPLATE") => ({
  text: <span><strong>Normal Attack</strong> {text}</span>,
  fields: talendPercent.map((percentArr, i) =>
  ({
    text: `${i + 1}-Hit DMG`,
    formulaText: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
    formula: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
  }))
})
export const basicCharged = (talentPercent, stamina, text = "Template") => ({
  text: <span><strong>Charged Attack</strong> {text}</span>,
  fields: [{
    text: `Charged Attack DMG`,
    formulaText: (tlvl, stats, c) => <span>{talentPercent[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
    formula: (tlvl, stats, c) => (talentPercent[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
  }, {
    text: `Stamina Cost`,
    value: `${stamina}`,
  }]
})
export const aimedCharged = (aimedShot, fullAimedShot, text = "TEMPLATE") => ({
  text: <span><strong>Charged Attack</strong> {text}</span>,
  fields: [{
    text: `Aimed Shot DMG`,
    formulaText: (tlvl, stats, c) => <span>{aimedShot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
    formula: (tlvl, stats, c) => (aimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
  }, {
    text: <span>Fully-Charged Aimed Shot DMG</span>,
    formulaText: (tlvl, stats, c) => <span>{fullAimedShot[tlvl]}% {Stat.getStatName(Character.getTalentStatKey("charged", c, true))}</span>,
    formula: (tlvl, stats, c) => (fullAimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
  }]
})
export const spinningCharged = (spinnning, final, stamina, duration, text = "TEMPLATE") => ({
  text: <span><strong>Charged Attack</strong> {text}</span>,
  fields: [{
    text: `Spinning DMG`,
    formulaText: (tlvl) => spinnning[tlvl] + "%",
    formula: (tlvl, stats) => (spinnning[tlvl] / 100) * stats.physical_charged_avgHit,
  }, {
    text: `Spinning Final DMG`,
    formulaText: (tlvl) => final[tlvl] + "%",
    formula: (tlvl, stats) => (final[tlvl] / 100) * stats.physical_charged_avgHit,
  }, {
    text: `Stamina Cost`,
    value: `${stamina}/s`,
  }, {
    text: `Max Duration`,
    value: `${duration}s`,
  }]
})
export const basicPlunging = (dmg, low, high, text = "Template") => ({
  text: <span><strong>Plunging Attack</strong> {text}</span>,
  fields: [{
    text: `Plunge DMG`,
    formulaText: (tlvl, stats, c) => <span>{dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    formula: (tlvl, stats) => (dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }, {
    text: `Low Plunge DMG`,
    formulaText: (tlvl, stats, c) => <span>{low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    formula: (tlvl, stats, c) => (low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }, {
    text: `High Plunge DMG`,
    formulaText: (tlvl, stats, c) => <span>{high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    formula: (tlvl, stats, c) => (high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }]
})
