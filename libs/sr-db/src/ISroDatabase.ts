import { type ISrObjectDescription } from '@genshin-optimizer/sr-srod'

export const SroSource = 'Star Rail Optimizer' as const
export const SroFormat = 'SRO' as const

export interface ISroDatabase extends ISrObjectDescription {
  format: typeof SroFormat
  version: 1
  dbVersion: number
  source: typeof SroSource
  // buildSettings?: Array<BuildSetting & { id: string }>
  [sroSettingsKey: string]: unknown
}
