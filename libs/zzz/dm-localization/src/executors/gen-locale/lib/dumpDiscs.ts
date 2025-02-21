import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { discsDetailedJSONData } from '@genshin-optimizer/zzz/dm'
export function dumpDiscs(fileDir: string) {
  const discNames = {} as Record<DiscSetKey, string>

  Object.entries(discsDetailedJSONData).forEach(([setKey, discData]) => {
    discNames[setKey] = discData.name

    dumpFile(`${fileDir}/disc_${setKey}_gen.json`, {
      name: discData.name,
      desc2: discData.desc2,
      desc4: discData.desc4,
      story: discData.story,
    })
  })
  dumpFile(`${fileDir}/discNames_gen.json`, discNames)
}
