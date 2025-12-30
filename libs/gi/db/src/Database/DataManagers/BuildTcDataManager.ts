import {
  zodClampedNumber,
  zodEnum,
  zodEnumWithDefault,
  zodNumberRecord,
  zodNumericLiteralWithDefault,
  zodObject,
  zodString,
  zodTypedRecordWith,
} from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSetKey,
  ArtifactSlotKey,
  AscensionKey,
  RefinementKey,
  WeaponKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactRarityKeys,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allAscensionKeys,
  allMainStatKeys,
  allRefinementKeys,
  allSubstatKeys,
  allWeaponKeys,
  substatTypeKeys,
} from '@genshin-optimizer/gi/consts'
import type { IGOOD } from '@genshin-optimizer/gi/good'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataManager } from '../DataManager'
import type { IGO, ImportResult } from '../exim'
import type { ICachedArtifact } from './ArtifactDataManager'
import type { ICachedWeapon } from './WeaponDataManager'

const buildTcArtifactSlotSchema = z.object({
  level: z.number().int().min(0).max(20).catch(20),
  statKey: zodEnumWithDefault(allMainStatKeys, 'atk'),
  rarity: zodNumericLiteralWithDefault(
    allArtifactRarityKeys,
    5
  ) as z.ZodType<ArtifactRarity>,
})
export type BuildTcArtifactSlot = z.infer<typeof buildTcArtifactSlotSchema>

const defaultSlot = (sk: ArtifactSlotKey): BuildTcArtifactSlot => ({
  level: 20,
  rarity: 5,
  statKey: sk === 'flower' ? 'hp' : sk === 'plume' ? 'atk' : 'atk_',
})

const buildTcArtifactSlotsSchema = zodTypedRecordWith(
  allArtifactSlotKeys,
  (sk) => buildTcArtifactSlotSchema.catch(defaultSlot(sk))
)

const buildTcSubstatsSchema = z.object({
  type: zodEnumWithDefault(substatTypeKeys, 'max'),
  stats: zodNumberRecord(allSubstatKeys, 0),
  rarity: zodNumericLiteralWithDefault(
    allArtifactRarityKeys,
    5
  ) as z.ZodType<ArtifactRarity>,
})

const buildTcArtifactSetsSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'object' || val === null) return {}
    const result: Partial<Record<ArtifactSetKey, 1 | 2 | 4>> = {}
    for (const [key, value] of Object.entries(val)) {
      if (
        allArtifactSetKeys.includes(key as ArtifactSetKey) &&
        (value === 1 || value === 2 || value === 4)
      ) {
        result[key as ArtifactSetKey] = value
      }
    }
    return result
  },
  z.record(z.string(), z.number())
) as z.ZodType<Partial<Record<ArtifactSetKey, 1 | 2 | 4>>>

const buildTcArtifactSchema = z.object({
  slots: buildTcArtifactSlotsSchema.catch(
    objKeyMap(allArtifactSlotKeys, defaultSlot)
  ),
  substats: zodObject(buildTcSubstatsSchema.shape).catch({
    type: 'max',
    stats: objKeyMap(allSubstatKeys, () => 0),
    rarity: 5,
  }),
  sets: buildTcArtifactSetsSchema,
})

const talentSchema = z.object({
  auto: zodClampedNumber(1, 15, 1),
  skill: zodClampedNumber(1, 15, 1),
  burst: zodClampedNumber(1, 15, 1),
})

const buildTcCharacterSchema = z
  .object({
    level: zodClampedNumber(1, 90, 1),
    ascension: zodNumericLiteralWithDefault(
      allAscensionKeys,
      0
    ) as z.ZodType<AscensionKey>,
    constellation: zodClampedNumber(0, 6, 0),
    talent: zodObject(talentSchema.shape).catch({
      auto: 1,
      skill: 1,
      burst: 1,
    }),
  })
  .optional()

const buildTcWeaponSchema = z.object({
  key: zodEnum(allWeaponKeys),
  level: zodClampedNumber(1, 90, 1),
  ascension: zodNumericLiteralWithDefault(
    allAscensionKeys,
    0
  ) as z.ZodType<AscensionKey>,
  refinement: zodNumericLiteralWithDefault(
    allRefinementKeys,
    1
  ) as z.ZodType<RefinementKey>,
})

const defaultMaxSubstats = () =>
  objKeyMap(
    allSubstatKeys,
    (k) => 6 * (k === 'hp' || k === 'atk' ? 4 : k === 'atk_' ? 2 : 5)
  )

const buildTcOptimizationSchema = z.object({
  distributedSubstats: z.number().int().catch(45),
  maxSubstats: zodNumberRecord(allSubstatKeys, 0).catch(defaultMaxSubstats()),
})

const buildTcSchema = z.object({
  name: zodString('Build(TC) Name'),
  description: zodString(),
  character: buildTcCharacterSchema,
  weapon: buildTcWeaponSchema,
  artifact: zodObject(buildTcArtifactSchema.shape).catch({
    slots: objKeyMap(allArtifactSlotKeys, defaultSlot),
    substats: {
      type: 'max',
      stats: objKeyMap(allSubstatKeys, () => 0),
      rarity: 5,
    },
    sets: {},
  }),
  optimization: zodObject(buildTcOptimizationSchema.shape).catch({
    distributedSubstats: 45,
    maxSubstats: defaultMaxSubstats(),
  }),
})

export type BuildTc = z.infer<typeof buildTcSchema>

// --- DataManager ---

export class BuildTcDataManager extends DataManager<
  string,
  'buildTcs',
  BuildTc,
  BuildTc,
  ArtCharDatabase
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'buildTcs')
    for (const key of this.database.storage.keys) {
      if (key.startsWith('buildTc_') && !this.set(key, {}))
        database.storage.remove(key)
    }
  }
  override validate(obj: unknown): BuildTc | undefined {
    const result = buildTcSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
  new(data: Partial<BuildTc>) {
    const id = this.generateKey()
    this.set(id, data)
    return id
  }
  duplicate(buildTcId: string): string {
    const buildTc = this.get(buildTcId)
    if (!buildTc) return ''
    return this.new(structuredClone(buildTc))
  }
  override remove(key: string, notify?: boolean): BuildTc | undefined {
    const buildTc = super.remove(key, notify)
    this.database.teamChars.entries.forEach(
      ([teamCharId, teamChar]) =>
        teamChar.buildTcIds.includes(key) &&
        this.database.teamChars.set(teamCharId, {})
    )
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutData?.some(
          (loadoutDatum) =>
            loadoutDatum?.buildTcId === key ||
            loadoutDatum?.compareBuildTcId === key
        ) && this.database.teams.set(teamId, {})
    )
    return buildTc
  }
  export(buildTcId: string): object | undefined {
    const buildTc = this.database.buildTcs.get(buildTcId)
    if (!buildTc) return undefined
    return buildTc
  }
  import(data: object): string {
    const id = this.generateKey()
    if (!this.set(id, data)) return ''
    return id
  }
  override importGOOD(good: IGOOD & IGO, result: ImportResult): void {
    result.buildTcs.beforeImport = this.entries.length
    const buildTcs = good[this.dataKey]
    if (buildTcs && Array.isArray(buildTcs)) {
      result.buildTcs.import = buildTcs.length
    }
    super.importGOOD(good, result)
  }
}

// --- Helper Functions ---

function initCharTCArtifactSlots(): BuildTc['artifact']['slots'] {
  return objKeyMap(allArtifactSlotKeys, defaultSlot)
}

function initBuildTcOptimizationMaxSubstats(): BuildTc['optimization']['maxSubstats'] {
  return defaultMaxSubstats()
}

export function initCharTC(weaponKey: WeaponKey): BuildTc {
  return {
    name: 'Build(TC) Name',
    description: '',
    weapon: {
      key: weaponKey,
      level: 1,
      ascension: 0,
      refinement: 1,
    },
    artifact: {
      slots: initCharTCArtifactSlots(),
      substats: {
        type: 'max',
        stats: objKeyMap(allSubstatKeys, () => 0),
        rarity: 5,
      },
      sets: {},
    },
    optimization: {
      distributedSubstats: 45,
      maxSubstats: initBuildTcOptimizationMaxSubstats(),
    },
  }
}

export function toBuildTc(
  charTC: BuildTc,
  eWeapon: ICachedWeapon | undefined = undefined,
  artifacts: Array<ICachedArtifact | undefined> = []
) {
  if (eWeapon) {
    charTC.weapon.key = eWeapon.key
    charTC.weapon.level = eWeapon.level
    charTC.weapon.ascension = eWeapon.ascension
    charTC.weapon.refinement = eWeapon.refinement
  }

  const oldType = charTC.artifact.substats.type
  charTC.artifact.substats.type = oldType
  charTC.artifact.slots = initCharTCArtifactSlots()
  charTC.artifact.substats.stats = objKeyMap(allSubstatKeys, () => 0)
  const sets: Partial<Record<ArtifactSetKey, number>> = {}
  artifacts.forEach((art) => {
    if (!art) return
    const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
    charTC.artifact.slots[slotKey].level = level
    charTC.artifact.slots[slotKey].statKey = mainStatKey
    charTC.artifact.slots[slotKey].rarity = rarity
    sets[setKey] = (sets[setKey] ?? 0) + 1
    substats.forEach((substat) => {
      if (substat.key)
        charTC.artifact.substats.stats[substat.key] =
          (charTC.artifact.substats.stats[substat.key] ?? 0) +
          substat.accurateValue
    })
  })
  charTC.artifact.sets = Object.fromEntries(
    Object.entries(sets)
      .map(([key, value]) => [
        key,
        value === 3
          ? 2
          : value === 5
            ? 4
            : value === 1 && !(key as string).startsWith('PrayersFor')
              ? 0
              : value,
      ])
      .filter(([, value]) => value)
  )
  return charTC
}
