import { clamp, objKeyMap, objMap } from '@genshin-optimizer/common/util'
import type {
  RelicMainStatKey,
  RelicSetKey,
  RelicSlotKey,
} from '@genshin-optimizer/sr/consts'
import {
  allLightConeKeys,
  allRelicSlotKeys,
  allRelicSubStatKeys,
  relicMaxLevel,
  relicSubstatTypeKeys,
} from '@genshin-optimizer/sr/consts'
import { validateLevelAsc } from '@genshin-optimizer/sr/util'
import type { ICachedLightCone, ICachedRelic } from '../../Interfaces'
import { minTotalStatKeys, type IBuildTc } from '../../Interfaces/IBuildTc'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'

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
    if (typeof obj !== 'object') return undefined
    let { name, description } = obj as IBuildTc
    const { lightCone, relic, optimization } = obj as IBuildTc

    if (typeof name !== 'string') name = 'Build(TC) Name'
    if (typeof description !== 'string') description = 'Build(TC) Description'
    const _lightCone = validateCharTCLightCone(lightCone)

    const _relic = validateCharTCRelic(relic)
    if (!_relic) return undefined
    const _optimization = validateCharTcOptimization(optimization)
    if (!_optimization) return undefined
    return {
      name,
      description,
      relic: _relic,
      lightCone: _lightCone,
      optimization: _optimization,
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
  override remove(key: string, notify?: boolean): IBuildTc | undefined {
    const buildTc = super.remove(key, notify)
    // remove data from loadout first
    this.database.loadouts.entries.forEach(
      ([loadoutId, loadout]) =>
        loadout.buildTcIds.includes(key) &&
        this.database.loadouts.set(loadoutId, {})
    )
    // once loadouts are validated, teams can be validated as well
    this.database.teams.entries.forEach(
      ([teamId, team]) =>
        team.loadoutMetadata?.some(
          (loadoutMetadatum) =>
            loadoutMetadatum?.buildTcId === key ||
            loadoutMetadatum?.compareBuildTcId === key
        ) && this.database.teams.set(teamId, {}) // trigger a validation
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
}

export function initCharTC(): IBuildTc {
  return {
    name: 'Build(TC) Name',
    description: 'Build(TC) Description',
    relic: {
      slots: initCharTCRelicSlots(),
      substats: {
        type: 'max',
        stats: objKeyMap(allRelicSubStatKeys, () => 0),
      },
      sets: {},
    },
    optimization: {
      distributedSubstats: 45,
      maxSubstats: initCharTcOptimizationMaxSubstats(),
      minTotal: {},
    },
  }
}
function initCharTCRelicSlots() {
  return objKeyMap(allRelicSlotKeys, (s) => ({
    level: 20,
    statKey: (s === 'head'
      ? 'hp'
      : s === 'hands'
      ? 'atk'
      : 'atk_') as RelicMainStatKey,
  }))
}

function validateCharTCLightCone(
  lightCone: unknown
): IBuildTc['lightCone'] | undefined {
  if (typeof lightCone !== 'object') return undefined
  const { key } = lightCone as Exclude<IBuildTc['lightCone'], undefined>
  let { level, ascension, superimpose } = lightCone as Exclude<
    IBuildTc['lightCone'],
    undefined
  >
  if (!allLightConeKeys.includes(key)) return undefined
  if (typeof superimpose !== 'number' || superimpose < 1 || superimpose > 5)
    superimpose = 1
  const { level: _level, ascension: _ascension } = validateLevelAsc(
    level,
    ascension
  )
  ;[level, ascension] = [_level, _ascension]
  return { key, level, ascension, superimpose }
}
function validateCharTCRelic(relic: unknown): IBuildTc['relic'] | undefined {
  if (typeof relic !== 'object') return undefined
  let {
    slots,
    substats: { type, stats },
    sets,
  } = relic as IBuildTc['relic']
  const _slots = validateCharTCRelicSlots(slots)
  if (!_slots) return undefined
  slots = _slots
  if (!relicSubstatTypeKeys.includes(type)) type = 'max'
  if (typeof stats !== 'object') stats = objKeyMap(allRelicSubStatKeys, () => 0)
  stats = objKeyMap(allRelicSubStatKeys, (k) =>
    typeof stats[k] === 'number' ? stats[k] : 0
  )

  if (typeof sets !== 'object') sets = {}
  // TODO: validate sets

  return { slots, substats: { type, stats }, sets }
}
function validateCharTCRelicSlots(
  slots: unknown
): IBuildTc['relic']['slots'] | undefined {
  if (typeof slots !== 'object') return initCharTCRelicSlots()

  if (
    Object.keys(slots as IBuildTc['relic']['slots']).length !==
      allRelicSlotKeys.length ||
    Object.keys(slots as IBuildTc['relic']['slots']).some(
      (s) => !allRelicSlotKeys.includes(s as RelicSlotKey)
    )
  )
    return initCharTCRelicSlots()
  return objMap(slots as IBuildTc['relic']['slots'], ({ level, ...rest }) => {
    return {
      level: clamp(level, 0, relicMaxLevel[5]),
      ...rest,
    }
  })
}
function validateCharTcOptimization(
  optimization: unknown
): IBuildTc['optimization'] | undefined {
  if (typeof optimization !== 'object') return undefined
  let { distributedSubstats, maxSubstats, minTotal } =
    optimization as IBuildTc['optimization']
  if (typeof distributedSubstats !== 'number') distributedSubstats = 20
  if (typeof maxSubstats !== 'object')
    maxSubstats = initCharTcOptimizationMaxSubstats()
  maxSubstats = objKeyMap([...allRelicSubStatKeys], (k) =>
    typeof maxSubstats[k] === 'number' ? maxSubstats[k] : 0
  )
  if (typeof minTotal !== 'object') minTotal = {}
  minTotal = Object.fromEntries(
    Object.entries(minTotal).filter(
      ([k, v]) => minTotalStatKeys.includes(k) && typeof v === 'number'
    )
  )

  return { distributedSubstats, maxSubstats, minTotal }
}
function initCharTcOptimizationMaxSubstats(): IBuildTc['optimization']['maxSubstats'] {
  return objKeyMap(
    allRelicSubStatKeys,
    (k) => 6 * (k === 'hp' || k === 'atk' ? 4 : k === 'atk_' ? 2 : 5)
  )
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
  )
  return charTC
}
