import {
  materialExcelConfigData,
  nameToKey,
  TextMapEN,
} from '@genshin-optimizer/dm'

export default function materialData() {
  const materialData = {}
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
