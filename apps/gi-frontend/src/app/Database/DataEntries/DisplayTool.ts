import { HOUR_MS } from '@genshin-optimizer/util'
import type { ArtCharDatabase } from '../Database'
import { DataEntry } from '../DataEntry'

export const RESIN_MAX = 160
export const timeZones = {
  America: -5 * HOUR_MS,
  Europe: HOUR_MS,
  Asia: 8 * HOUR_MS,
  'TW, HK, MO': 8 * HOUR_MS,
}
export type TimeZoneKey = keyof typeof timeZones

interface IDisplayToolEntry {
  resin: number
  resinDate: number
  timeZoneKey: TimeZoneKey
}
export const defThreads = navigator?.hardwareConcurrency || 4
function initialTabOptimize(): IDisplayToolEntry {
  return {
    resin: RESIN_MAX,
    resinDate: new Date().getTime(),
    timeZoneKey: Object.keys(timeZones)[0] as TimeZoneKey,
  }
}

export class DisplayToolEntry extends DataEntry<
  'display_tool',
  'display_tool',
  IDisplayToolEntry,
  IDisplayToolEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_tool', initialTabOptimize, 'display_tool')
  }
  override validate(obj: any): IDisplayToolEntry | undefined {
    if (typeof obj !== 'object') return undefined
    let { timeZoneKey, resin, resinDate } = obj
    if (!Object.keys(timeZones).includes(timeZoneKey))
      timeZoneKey = Object.keys(timeZones)[0]
    if (typeof resin !== 'number' || resin < 0 || !Number.isInteger(resin))
      resin = RESIN_MAX
    if (
      typeof resinDate !== 'number' ||
      resinDate < 0 ||
      !Number.isInteger(resinDate)
    )
      resinDate = new Date().getTime()
    return { timeZoneKey, resin, resinDate } as IDisplayToolEntry
  }
}
