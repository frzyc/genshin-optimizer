import {
  groupTwoPc,
  type TwoPcGroup,
  type TwoPcStats,
} from '@genshin-optimizer/common/util'
import {
  type ArtifactSetKey,
  allArtifactSetKeys,
  allElementKeys,
} from '@genshin-optimizer/gi/consts'
import type { StatKey } from '@genshin-optimizer/gi/keymap'

/** Circlets with no 2-piece bonus. They cannot satisfy a 2-piece count. */
const noTwoPc = new Set<ArtifactSetKey>([
  'PrayersForDestiny',
  'PrayersForIllumination',
  'PrayersForWisdom',
  'PrayersToSpringtime',
])

/**
 * 2-piece bonuses that are not a plain stat map (conditionals, or a formula
 * the passive table cannot describe). Each stays its own row.
 */
const specialTwoPc = new Set<ArtifactSetKey>([
  'ObsidianCodex',
  'ScrollOfTheHeroOfCinderCity',
])

function bonus(stats: Partial<Record<StatKey, number>>): TwoPcStats {
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(stats)) {
    if (typeof value === 'number') out[key] = value
  }
  return out
}

const elementalResKeys = allElementKeys.map((ele) => `${ele}_res_`)
const elementalRes: TwoPcStats = bonus(
  Object.fromEntries(elementalResKeys.map((key) => [key, 0.2]))
)

/** All-element resistance, such as Tiny Miracle's 2-piece. One element stays separate. */
export function elementalResBonus(
  stats: TwoPcStats | undefined
): number | undefined {
  if (!stats) return undefined
  const entries = Object.entries(stats)
  if (entries.length !== elementalResKeys.length) return undefined
  const value = entries[0]?.[1]
  if (typeof value !== 'number') return undefined
  if (!elementalResKeys.every((key) => key in stats && stats[key] === value))
    return undefined
  return value
}

/**
 * Plain 2-piece passives. Values match the formula sheets (`cmpGE(count, 2, …)`).
 * Sets missing from this map and from {@link specialTwoPc} are omitted only
 * when they have no 2-piece at all.
 */
const plainTwoPc: Partial<Record<ArtifactSetKey, TwoPcStats>> = {
  ADayCarvedFromRisingWinds: bonus({ atk_: 0.18 }),
  Adventurer: bonus({ hp: 1000 }),
  ArchaicPetra: bonus({ geo_dmg_: 0.15 }),
  AubadeOfMorningstarAndMoon: bonus({ eleMas: 80 }),
  Berserker: bonus({ critRate_: 0.12 }),
  BlizzardStrayer: bonus({ cryo_dmg_: 0.15 }),
  BloodstainedChivalry: bonus({ physical_dmg_: 0.25 }),
  BraveHeart: bonus({ atk_: 0.18 }),
  CelestialGift: bonus({ enerRech_: 0.2 }),
  CrimsonWitchOfFlames: bonus({ pyro_dmg_: 0.15 }),
  DeepwoodMemories: bonus({ dendro_dmg_: 0.15 }),
  DefendersWill: bonus({ def_: 0.3 }),
  DesertPavilionChronicle: bonus({ anemo_dmg_: 0.15 }),
  DisenchantmentInDeepShadow: bonus({ atk_: 0.18 }),
  EchoesOfAnOffering: bonus({ atk_: 0.18 }),
  EmblemOfSeveredFate: bonus({ enerRech_: 0.2 }),
  FinaleOfTheDeepGalleries: bonus({ cryo_dmg_: 0.15 }),
  FlowerOfParadiseLost: bonus({ eleMas: 80 }),
  FragmentOfHarmonicWhimsy: bonus({ atk_: 0.18 }),
  Gambler: bonus({ skill_dmg_: 0.2 }),
  GildedDreams: bonus({ eleMas: 80 }),
  GladiatorsFinale: bonus({ atk_: 0.18 }),
  GoldenTroupe: bonus({ skill_dmg_: 0.2 }),
  HeartOfDepth: bonus({ hydro_dmg_: 0.15 }),
  HeartOfTheFurnace: bonus({ atk_: 0.18 }),
  HuskOfOpulentDreams: bonus({ def_: 0.3 }),
  Instructor: bonus({ eleMas: 80 }),
  Lavawalker: bonus({ pyro_res_: 0.4 }),
  LongNightsOath: bonus({ plunging_dmg_: 0.25 }),
  LuckyDog: bonus({ def: 100 }),
  MaidenBeloved: bonus({ heal_: 0.15 }),
  MarechausseeHunter: bonus({ normal_dmg_: 0.15, charged_dmg_: 0.15 }),
  MartialArtist: bonus({ normal_dmg_: 0.15, charged_dmg_: 0.15 }),
  NightOfTheSkysUnveiling: bonus({ eleMas: 80 }),
  NighttimeWhispersInTheEchoingWoods: bonus({ atk_: 0.18 }),
  NoblesseOblige: bonus({ burst_dmg_: 0.2 }),
  NymphsDream: bonus({ hydro_dmg_: 0.15 }),
  OceanHuedClam: bonus({ heal_: 0.15 }),
  PaleFlame: bonus({ physical_dmg_: 0.25 }),
  ResolutionOfSojourner: bonus({ atk_: 0.18 }),
  RetracingBolide: bonus({ shield_: 0.35 }),
  ScarletProof: bonus({ atk_: 0.18 }),
  Scholar: bonus({ enerRech_: 0.2 }),
  ShimenawasReminiscence: bonus({ atk_: 0.18 }),
  SilkenMoonsSerenade: bonus({ enerRech_: 0.2 }),
  SongOfDaysPast: bonus({ heal_: 0.15 }),
  TenacityOfTheMillelith: bonus({ hp_: 0.2 }),
  TheExile: bonus({ enerRech_: 0.2 }),
  ThunderingFury: bonus({ electro_dmg_: 0.15 }),
  Thundersoother: bonus({ electro_res_: 0.4 }),
  TinyMiracle: elementalRes,
  TravelingDoctor: bonus({ incHeal_: 0.2 }),
  UnfinishedReverie: bonus({ atk_: 0.18 }),
  VermillionHereafter: bonus({ atk_: 0.18 }),
  ViridescentVenerer: bonus({ anemo_dmg_: 0.15 }),
  VourukashasGlow: bonus({ hp_: 0.2 }),
  WanderersTroupe: bonus({ eleMas: 80 }),
}

export const artifactTwoPcGroups: TwoPcGroup<ArtifactSetKey>[] = groupTwoPc(
  allArtifactSetKeys
    .filter((set) => !noTwoPc.has(set))
    .map((set) => ({
      set,
      stats: specialTwoPc.has(set) ? null : (plainTwoPc[set] ?? null),
    }))
)

export const artifactTwoPcSets: ArtifactSetKey[] = artifactTwoPcGroups.flatMap(
  (group) => group.sets
)
