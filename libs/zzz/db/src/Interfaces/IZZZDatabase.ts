import type { IDisc } from '@genshin-optimizer/zzz/zood'

export const zzzSource = 'Zenless Optimizer' as const
export const zzzFormat = 'ZZZ' as const

export type IZenlessObjectDescription = {
  format: string
  source: string
  version: 1
  discs?: IDisc[]
}
export interface IZZZDatabase extends IZenlessObjectDescription {
  version: 1
  dbVersion: number
  source: typeof zzzSource
  // buildSettings?: Array<BuildSetting & { id: string }>
  [zzzSettingsKey: string]: unknown
}
