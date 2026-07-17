import { nameToKey } from '@genshin-optimizer/common/util'
import type { MaterialTypeKey } from '@genshin-optimizer/gi/dm'
import { materialExcelConfigData, TextMapEN } from '@genshin-optimizer/gi/dm'

export default function materialData() {
  const materialData: Record<string, { type?: MaterialTypeKey }> = {}
  Object.entries(materialExcelConfigData).forEach(([_id, material]) => {
    const { nameTextMapHash, materialType } = material
    const key = nameToKey(TextMapEN[nameTextMapHash])
    if (!key) return
    materialData[key] = {
      type: materialType,
    }
  })
  return materialData
}
