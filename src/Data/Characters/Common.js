
export const basicNormal = (talentPercent, text = "TEMPLATE") => ({
    text: <span><strong>Normal Attack</strong> {text}</span>,
    fields: talendPercent.map((percentArr, i) =>
    ({
      text: `${i + 1}-Hit DMG`,
      basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
      finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
      formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
      variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
    }))
})
export const basicCharged = (talentPercent, stamina, text = "Template") => ({
    text: <span><strong>Charged Attack</strong> {text}</span>,
    fields: [{
      text: `Charged Attack DMG`,
      basicVal: (tlvl, stats, c) => <span>{talentPercent[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
      finalVal: (tlvl, stats, c) => (talentPercent[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
      formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: talentPercent[tlvl] / 100 }),
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
      basicVal: (tlvl, stats, c) => <span>{aimedShot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
      finalVal: (tlvl, stats, c) => (aimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
      formula: (tlvl, s, c) => ({ [Character.getTalentStatKey("charged", c)]: aimedShot[tlvl] / 100 }),
      variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
    }, {
      text: <span>Fully-Charged Aimed Shot DMG</span>,
      basicVal: (tlvl, stats, c) => <span>{fullAimedShot[tlvl]}% {Stat.getStatName(Character.getTalentStatKey("charged", c, true))}</span>,
      finalVal: (tlvl, stats, c) => (fullAimedShot[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)],
      formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c, true)]: fullAimedShot[tlvl] / 100 }),
      variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
    }]
})
export const spinningCharged = (spinnning, final, stamina, duration, text = "TEMPLATE") => ({
  text: <span><strong>Charged Attack</strong> {text}</span>,
  fields: [{
    text: `Spinning DMG`,
    basicVal: (tlvl) => spinnning[tlvl] + "%",
    finalVal: (tlvl, stats) => (spinnning[tlvl] / 100) * stats.physical_charged_avgHit,
    formula: (tlvl) => ({ physical_charged_avgHit: spinnning[tlvl] / 100 }),
  }, {
    text: `Spinning Final DMG`,
    basicVal: (tlvl) => final[tlvl] + "%",
    finalVal: (tlvl, stats) => (final[tlvl] / 100) * stats.physical_charged_avgHit,
    formula: (tlvl) => ({ physical_charged_avgHit: final[tlvl] / 100 }),
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
    basicVal: (tlvl, stats, c) => <span>{dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    finalVal: (tlvl, stats) => (dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    formula: (tlvl) => ({ [Character.getTalentStatKey("plunging", c)]: dmg[tlvl] / 100 }),
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }, {
    text: `Low Plunge DMG`,
    basicVal: (tlvl, stats, c) => <span>{low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    finalVal: (tlvl, stats, c) => (low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: low[tlvl] / 100 }),
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }, {
    text: `High Plunge DMG`,
    basicVal: (tlvl, stats, c) => <span>{high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
    finalVal: (tlvl, stats, c) => (high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
    formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: high[tlvl] / 100 }),
    variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
  }]
})
