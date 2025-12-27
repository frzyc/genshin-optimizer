import { HOUR_MS } from '@genshin-optimizer/common/util'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const RESIN_MAX = 200
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
  tcMode?: boolean
}

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
    if (typeof obj !== 'object' || obj === null) return undefined
    let { timeZoneKey, resin, resinDate, tcMode } = obj
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
    if (typeof tcMode !== 'boolean') tcMode = !!tcMode
    return { timeZoneKey, resin, resinDate, tcMode } as IDisplayToolEntry
  }
}
