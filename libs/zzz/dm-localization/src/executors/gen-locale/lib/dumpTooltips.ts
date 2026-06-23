import { dumpFile } from '@genshin-optimizer/common/pipeline'
import { tooltipJSONData } from '@genshin-optimizer/zzz/dm'
import { processText } from './util'

export function dumpTooltips(fileDir: string) {
  dumpFile(
    `${fileDir}/tooltips_gen.json`,
    Object.fromEntries(
      Object.entries(tooltipJSONData).map(([key, tooltip]) => [
        key,
        {
          name: tooltip.name,
          desc: processText(tooltip.desc),
        },
      ])
    )
  )
}
