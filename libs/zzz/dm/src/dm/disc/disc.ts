import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { readHakushinJSON } from '../../util'
import { DiscIdMap } from './consts'

type DiscRawData = {
  id: number
  Name: string
  Desc2: string
  Desc4: string
  Story: string
}
export type DiscData = {
  name: string
  desc2: string
  desc4: string
  story: string
}
export const discsDetailedJSONData = Object.fromEntries(
  Object.entries(DiscIdMap).map(([id, name]) => {
    const raw = JSON.parse(
      readHakushinJSON(`equipment/${id}.json`)
    ) as DiscRawData
    const data: DiscData = {
      name: raw.Name,
      desc2: raw.Desc2,
      desc4: raw.Desc4,
      story: raw.Story,
    }
    return [name, data] as const
  })
) as Record<DiscSetKey, DiscData>
