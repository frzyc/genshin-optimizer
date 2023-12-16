import { type ISRDatabase } from '@genshin-optimizer/sr-data'

export const SROSource = 'Star Rail Optimizer' as const

export interface ISRODatabase extends ISRDatabase {
  format: 'SRO'
  version: 1
  dbVersion: number
  source: typeof SROSource
  // buildSettings?: Array<BuildSetting & { id: string }>
  [sroSettingsKey: string]: unknown
}
