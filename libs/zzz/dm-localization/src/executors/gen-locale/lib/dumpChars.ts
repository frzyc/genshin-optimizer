import { dumpFile } from '@genshin-optimizer/common/pipeline'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { charactersDetailedJSONData } from '@genshin-optimizer/zzz/dm'
export function dumpChars(fileDir: string) {
  const charNames = {} as Record<CharacterKey, string>

  Object.entries(charactersDetailedJSONData).forEach(([charKey, charData]) => {
    charNames[charKey] = charData.name

    dumpFile(`${fileDir}/char_${charKey}_gen.json`, {
      name: charData.name,
      // TODO: actual skill/core data
    })
  })
  dumpFile(`${fileDir}/charNames_gen.json`, charNames)
}
