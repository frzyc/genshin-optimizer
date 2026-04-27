import {
  zodBoolean,
  zodEnumWithDefault,
} from '@genshin-optimizer/common/database'
import { HOUR_MS } from '@genshin-optimizer/common/util'
import { z } from 'zod'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const RESIN_MAX = 200
export const timeZones = {
  America: -5 * HOUR_MS,
  Europe: HOUR_MS,
  Asia: 8 * HOUR_MS,
  'TW, HK, MO': 8 * HOUR_MS,
}
const timeZoneKeys = Object.keys(timeZones) as [TimeZoneKey, ...TimeZoneKey[]]
export type TimeZoneKey = keyof typeof timeZones

const displayToolSchema = z.object({
  resin: z
    .number()
    .int()
    .min(0)
    .catch(() => RESIN_MAX),
  resinDate: z
    .number()
    .int()
    .min(0)
    .catch(() => Date.now()),
  timeZoneKey: zodEnumWithDefault(timeZoneKeys, timeZoneKeys[0]),
  tcMode: zodBoolean().optional(),
})
export type IDisplayToolEntry = z.infer<typeof displayToolSchema>

function initialState(): IDisplayToolEntry {
  return displayToolSchema.parse({})
}

export class DisplayToolEntry extends DataEntry<
  'display_tool',
  'display_tool',
  IDisplayToolEntry,
  IDisplayToolEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_tool', initialState, 'display_tool')
  }
  override validate(obj: unknown): IDisplayToolEntry | undefined {
    const result = displayToolSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
