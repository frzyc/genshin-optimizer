import { unzipFromB64Gzip } from '@genshin-optimizer/common/util'

export function loadJsonOrB64GzipFromStorage(key: string): any {
  const rawValue = localStorage.getItem(key)
  let obj = {}
  if (rawValue)
    try {
      // Handle if the value is uncompressed JSON string
      obj = JSON.parse(rawValue)
    } catch {
      // If JSON parse fails, then it should be a compressed b64 gzip
      obj = JSON.parse(unzipFromB64Gzip(rawValue))
    }

  return obj
}
