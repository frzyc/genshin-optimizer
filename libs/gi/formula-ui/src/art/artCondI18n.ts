import {
  allElementKeys,
  type ArtifactSetKey,
  type ElementKey,
} from '@genshin-optimizer/gi/consts'

export type CondI18nRef = {
  ns: string
  key: string
  values?: Record<string, string | number>
}

type CondSrc =
  | { art: string }
  | { sheet: string; values?: Record<string, string | number> }

/** Formula cond name → locale, matching WR `name:` / ZZZ `ch()` authored keys. */
const bySet: Partial<Record<ArtifactSetKey, Record<string, CondSrc>>> = {
  ADayCarvedFromRisingWinds: {
    set4: { sheet: 'hitOp.normalChargedSkillBurst' },
  },
  ArchaicPetra: { element: { art: 'condName' } },
  AubadeOfMorningstarAndMoon: { set4: { sheet: 'charOffField' } },
  Berserker: { hp: { sheet: 'lessPercentHP', values: { percent: 70 } } },
  BlizzardStrayer: { state: { art: 'condName' } },
  BloodstainedChivalry: {
    defeat: { sheet: 'afterDefeatEnemy', values: { percent: 70 } },
  },
  BraveHeart: {
    hp: { sheet: 'enemyGreaterPercentHP', values: { percent: 50 } },
  },
  CelestialGift: { set4: { sheet: 'afterUse.skill' } },
  CrimsonWitchOfFlames: { stack: { sheet: 'afterUse.skill' } },
  DeepwoodMemories: { set4: { sheet: 'hitOp.skillOrBurst' } },
  DesertPavilionChronicle: { set4: { sheet: 'hitOp.charged' } },
  DisenchantmentInDeepShadow: {
    state: { sheet: 'enemyAffected.superconductOrStellarconduct' },
  },
  EchoesOfAnOffering: { mode: { art: 'mode' } },
  FinaleOfTheDeepGalleries: {
    '0EnergyNoBurst': { art: 'noBurst' },
    '0EnergyNoNormal': { art: 'noNormal' },
  },
  FlowerOfParadiseLost: { stacks: { art: 'condName' } },
  FragmentOfHarmonicWhimsy: { stacks: { sheet: 'bond.changes' } },
  GildedDreams: {
    passive: { sheet: 'afterReaction' },
    overrideSame: { art: 'overrideSameCond' },
    overrideOther: { art: 'overrideOtherCond' },
  },
  GoldenTroupe: { set4: { sheet: 'charOffField' } },
  HeartOfDepth: { skill: { sheet: 'afterUse.skill' } },
  HeartOfTheFurnace: {
    '4Stellar': { sheet: 'elementalReaction.stellar.triggerOrHit' },
  },
  HuskOfOpulentDreams: { stack: { art: 'condName' } },
  Instructor: { set4: { sheet: 'afterReaction' } },
  Lavawalker: { state: { sheet: 'enemyAffected.burningOrPyro' } },
  LongNightsOath: { stacks: { sheet: 'stacks' } },
  MaidenBeloved: { state: { sheet: 'afterUse.skillOrBurst' } },
  MarechausseeHunter: { set4: { sheet: 'hpChange' } },
  MartialArtist: { state: { sheet: 'afterUse.skill' } },
  NightOfTheSkysUnveiling: {
    '4GleamingMoon': { sheet: 'elementalReaction.team.lunar' },
  },
  NighttimeWhispersInTheEchoingWoods: {
    afterSkill: { sheet: 'hitOp.skill' },
    crystallize: { sheet: 'protectedByShieldCrystalOrLunar' },
  },
  NoblesseOblige: { set4: { sheet: 'afterUse.burst' } },
  NymphsDream: { set4: { art: 'condName' } },
  ObsidianCodex: {
    '2NightsoulBlessing': { art: 'cond2Name' },
    '4NightsoulConsume': { art: 'cond4Name' },
  },
  PaleFlame: { stacks: { sheet: 'hitOp.skill' } },
  RetracingBolide: { state: { sheet: 'protectedByShield' } },
  ScarletProof: { '4Ss': { sheet: 'elementalReaction.stellarswirl' } },
  ShimenawasReminiscence: { usedEnergy: { art: 'afterUseEnergy' } },
  SilkenMoonsSerenade: { '4GleamingMoon': { sheet: 'hitOp.ele' } },
  SongOfDaysPast: { healing: { art: 'condName' } },
  TenacityOfTheMillelith: { skill: { sheet: 'hitOp.skill' } },
  Thundersoother: { state: { sheet: 'enemyAffected.electro' } },
  TinyMiracle: { element: { art: 'condName' } },
  UnfinishedReverie: { stacks: { sheet: 'stacks' } },
  VermillionHereafter: {
    afterBurst: { sheet: 'afterUse.burst' },
    stacks: { sheet: 'stacks' },
  },
  VourukashasGlow: { set4: { sheet: 'takeDmg' } },
}

const byName: Record<string, CondSrc> = {
  stack: { sheet: 'stacks' },
  stacks: { sheet: 'stacks' },
  set2: { sheet: '2set' },
  set4: { sheet: '4set' },
}

function isElementKey(val: string): val is ElementKey {
  return (allElementKeys as readonly string[]).includes(val)
}

function toRef(setKey: ArtifactSetKey, src: CondSrc): CondI18nRef {
  if ('art' in src) return { ns: `artifact_${setKey}`, key: src.art }
  return src.values
    ? { ns: 'sheet', key: src.sheet, values: src.values }
    : { ns: 'sheet', key: src.sheet }
}

function patternRefs(name: string): CondI18nRef[] {
  const swirl = /^swirl(.+)$/i.exec(name)
  if (swirl && isElementKey(swirl[1].toLowerCase()))
    return [{ ns: 'sheet', key: `swirlReaction.${swirl[1].toLowerCase()}` }]
  const react = /^react_(.+)$/.exec(name)
  if (react && isElementKey(react[1]))
    return [{ ns: 'sheet', key: `elementalReaction.${react[1]}` }]
  const nightsoul = /^nightsoul_(.+)$/.exec(name)
  if (nightsoul && isElementKey(nightsoul[1]))
    return [{ ns: 'sheet', key: `elementalReaction.nightsoul.${nightsoul[1]}` }]
  return []
}

/** Unique i18n lookups, ZZZ-style: authored `ch()` then shared `st()`. */
export function artCondI18nCandidates(
  setKey: ArtifactSetKey,
  name: string
): CondI18nRef[] {
  const artNs = `artifact_${setKey}`
  const refs: CondI18nRef[] = []
  const seen = new Set<string>()
  const add = (ref: CondI18nRef | undefined) => {
    if (!ref) return
    const id = `${ref.ns}:${ref.key}`
    if (seen.has(id)) return
    seen.add(id)
    refs.push(ref)
  }

  const mapped = bySet[setKey]?.[name]
  if (mapped) add(toRef(setKey, mapped))
  for (const ref of patternRefs(name)) add(ref)
  add({ ns: artNs, key: name })
  const generic = byName[name]
  if (generic) add(toRef(setKey, generic))
  add({ ns: 'sheet', key: name })
  return refs
}

/** Last-resort display when no locale key exists. */
export function humanizeArtCondName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/(\d+)([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d+)/g, '$1 $2')
    .trim()
}
