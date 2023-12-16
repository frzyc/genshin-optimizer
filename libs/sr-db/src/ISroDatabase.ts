import { type ISrDatabase } from '@genshin-optimizer/sr-data'

export const SroSource = 'Star Rail Optimizer' as const

export interface ISroDatabase extends ISrDatabase {
  format: 'Sro'
  version: 1
  dbVersion: number
  source: typeof SroSource
  // buildSettings?: Array<BuildSetting & { id: string }>
  [sroSettingsKey: string]: unknown
}
