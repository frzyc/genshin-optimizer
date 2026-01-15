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
import { clamp, objKeyMap } from '@genshin-optimizer/common/util'
import type {
  AscensionKey,
  CharacterKey,
  RelicMainStatKey,
  RelicRarityKey,
  RelicSetKey,
  RelicSlotKey,
  SuperimposeKey,
} from '@genshin-optimizer/sr/consts'
import {
  allAscensionKeys,
  allCharacterKeys,
  allLightConeKeys,
  allRelicRarityKeys,
  allRelicSetKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
  allSuperimposeKeys,
  relicMaxLevel,
  relicSubstatTypeKeys,
  validateLevelAsc,
} from '@genshin-optimizer/sr/consts'
import { z } from 'zod'
import type { ICachedLightCone, ICachedRelic } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

const buildTcRelicSlotSchema = z.object({
  level: z.number().int().min(0).max(15).catch(15),
  statKey: zodEnumWithDefault(
    [
      'hp',
      'atk',
      'hp_',
      'atk_',
      'def_',
      'spd',
      'crit_',
      'crit_dmg_',
      'heal_',
      'eff_',
      'eff_res_',
      'brEff_',
    ] as const,
    'atk_'
  ) as z.ZodType<RelicMainStatKey>,
  rarity: zodNumericLiteralWithDefault(
    allRelicRarityKeys,
    5
  ) as z.ZodType<RelicRarityKey>,
})

export type BuildTcRelicSlot = z.infer<typeof buildTcRelicSlotSchema>

const defaultSlot = (sk: RelicSlotKey): BuildTcRelicSlot => ({
  level: 15,
  rarity: 5,
  statKey: sk === 'head' ? 'hp' : sk === 'hands' ? 'atk' : 'atk_',
})

const buildTcRelicSlotsSchema = zodTypedRecordWith(allRelicSlotKeys, (sk) =>
  buildTcRelicSlotSchema.catch(defaultSlot(sk))
)

const buildTcSubstatsSchema = z.object({
  type: zodEnumWithDefault(relicSubstatTypeKeys, 'max'),
  stats: zodNumberRecord(allRelicSubStatKeys, 0),
  rarity: zodNumericLiteralWithDefault(
    allRelicRarityKeys,
    5
  ) as z.ZodType<RelicRarityKey>,
})

const buildTcSetsSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'object' || val === null) return {}
    const result: Partial<Record<RelicSetKey, 2 | 4>> = {}
    for (const [key, value] of Object.entries(val)) {
      if (
        allRelicSetKeys.includes(key as RelicSetKey) &&
        (value === 2 || value === 4)
      ) {
        result[key as RelicSetKey] = value
      }
    }
    return result
  },
  z.record(z.string(), z.number())
) as z.ZodType<Partial<Record<RelicSetKey, 2 | 4>>>

const buildTcRelicSchema = z.object({
  slots: buildTcRelicSlotsSchema.catch(
    objKeyMap(allRelicSlotKeys, defaultSlot)
  ),
  substats: zodObject(buildTcSubstatsSchema.shape).catch({
    type: 'max',
    stats: objKeyMap(allRelicSubStatKeys, () => 0),
    rarity: 5,
  }),
  sets: buildTcSetsSchema,
})

const buildTcLightConeSchema = z.object({
  key: zodEnum(allLightConeKeys),
  level: zodClampedNumber(1, 80, 1),
  ascension: zodNumericLiteralWithDefault(
    allAscensionKeys,
    0
  ) as z.ZodType<AscensionKey>,
  superimpose: zodNumericLiteralWithDefault(
    allSuperimposeKeys,
    1
  ) as z.ZodType<SuperimposeKey>,
})

const defaultMaxSubstats = () =>
  objKeyMap(
    allRelicSubStatKeys,
    (k) => 6 * (k === 'hp' || k === 'atk' ? 4 : k === 'atk_' ? 2 : 5)
  )

const buildTcOptimizationSchema = z.object({
  distributedSubstats: z.number().int().catch(45),
  maxSubstats: zodNumberRecord(allRelicSubStatKeys, 0).catch(
    defaultMaxSubstats()
  ),
})

export const buildTcSchema = z.object({
  name: z.string().catch('Build(TC) Name'),
  description: zodString('Build(TC) Description'),
  characterKey: z.enum(allCharacterKeys),
  teamId: z.string().optional(),
  lightCone: buildTcLightConeSchema.optional().catch(undefined),
  relic: zodObject(buildTcRelicSchema.shape).catch({
    slots: objKeyMap(allRelicSlotKeys, defaultSlot),
    substats: {
      type: 'max',
      stats: objKeyMap(allRelicSubStatKeys, () => 0),
      rarity: 5,
    },
    sets: {},
  }),
  optimization: zodObject(buildTcOptimizationSchema.shape).catch({
    distributedSubstats: 45,
    maxSubstats: defaultMaxSubstats(),
  }),
})

export type IBuildTc = z.infer<typeof buildTcSchema>
export type BuildTCLightCone = NonNullable<IBuildTc['lightCone']>

export class BuildTcDataManager extends DataManager<
  string,
  'buildTcs',
  IBuildTc,
  IBuildTc
> {
  constructor(database: SroDatabase) {
    super(database, 'buildTcs')
  }
  override validate(obj: unknown): IBuildTc | undefined {
    const result = buildTcSchema.safeParse(obj)
    if (!result.success) return undefined

    const { lightCone, relic, ...rest } = result.data

    // Validate lightCone level/ascension
    let validatedLightCone = lightCone
    if (lightCone) {
      const { level, ascension } = validateLevelAsc(
        lightCone.level,
        lightCone.ascension
      )
      validatedLightCone = { ...lightCone, level, ascension }
    }

    // Clamp relic slot levels to rarity max
    const validatedSlots = objKeyMap(allRelicSlotKeys, (sk) => {
      const slot = relic.slots[sk]
      return {
        ...slot,
        level: clamp(slot.level, 0, relicMaxLevel[slot.rarity]),
      }
    })

    return {
      ...rest,
      lightCone: validatedLightCone,
      relic: {
        ...relic,
        slots: validatedSlots,
      },
    }
  }
  new(data: Partial<IBuildTc>) {
    const id = this.generateKey()
    this.set(id, data)
    return id
  }
  duplicate(buildTcId: string): string {
    const buildTc = this.get(buildTcId)
    if (!buildTc) return ''
    return this.new(structuredClone(buildTc))
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
  getBuildTcIds(characterKey: CharacterKey) {
    return this.keys.filter(
      (key) => this.get(key)?.characterKey === characterKey
    )
  }
}

export function initCharTC(characterKey: CharacterKey): IBuildTc {
  return {
    characterKey,
    name: 'Build(TC) Name',
    description: 'Build(TC) Description',
    relic: {
      slots: initCharTCRelicSlots(),
      substats: {
        type: 'max',
        stats: objKeyMap(allRelicSubStatKeys, () => 0),
        rarity: 5,
      },
      sets: {},
    },
    optimization: {
      distributedSubstats: 45,
      maxSubstats: defaultMaxSubstats(),
    },
  }
}

function initCharTCRelicSlots(): Record<RelicSlotKey, BuildTcRelicSlot> {
  return objKeyMap(allRelicSlotKeys, (s) => ({
    level: 15,
    rarity: 5,
    statKey: (s === 'head'
      ? 'hp'
      : s === 'hands'
        ? 'atk'
        : 'atk_') as RelicMainStatKey,
  }))
}

export function toBuildTc(
  charTC: IBuildTc,
  eLightCone: ICachedLightCone | undefined = undefined,
  relics: Array<ICachedRelic | undefined> = []
) {
  if (eLightCone) {
    charTC.lightCone = {
      key: eLightCone.key,
      level: eLightCone.level,
      ascension: eLightCone.ascension,
      superimpose: eLightCone.superimpose,
    }
  }

  const oldType = charTC.relic.substats.type
  charTC.relic.substats.type = oldType
  charTC.relic.slots = initCharTCRelicSlots()
  charTC.relic.substats.stats = objKeyMap(allRelicSubStatKeys, () => 0)
  const sets: Partial<Record<RelicSetKey, number>> = {}
  relics.forEach((relic) => {
    if (!relic) return
    const { slotKey, setKey, substats, mainStatKey, level } = relic
    charTC.relic.slots[slotKey].level = level
    charTC.relic.slots[slotKey].statKey = mainStatKey
    sets[setKey] = (sets[setKey] ?? 0) + 1
    substats.forEach((substat) => {
      if (substat.key)
        charTC.relic.substats.stats[substat.key] =
          (charTC.relic.substats.stats[substat.key] ?? 0) +
          substat.accurateValue
    })
  })
  charTC.relic.sets = Object.fromEntries(
    Object.entries(sets)
      .map(([key, value]) => [key, value === 3 ? 2 : value === 5 ? 4 : value])
      .filter(([, value]) => value)
  ) as Partial<Record<RelicSetKey, 2 | 4>>
  return charTC
}
