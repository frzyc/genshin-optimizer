import { readHakushinJSON } from '../../util'

export type TooltipRawData = {
  Name: string
  Desc: string
  Skill: string
}

export type TooltipData = {
  name: string
  desc: string
}

export const tooltipJSONDataSrc = JSON.parse(
  readHakushinJSON('noun.json')
) as Record<string, TooltipRawData>
const tooltipJSONData = {} as Record<string, TooltipData>
Object.entries(tooltipJSONDataSrc).forEach(([key, tooltip]) => {
  tooltipJSONData[key] = {
    name: tooltip.Name,
    desc: tooltip.Desc,
  }
})
export { tooltipJSONData }
