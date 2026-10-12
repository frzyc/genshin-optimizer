import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'

export function compressToB64Gzip(obj: object) {
  return btoa(strFromU8(gzipSync(strToU8(JSON.stringify(obj))), true))
}

export function unzipFromB64Gzip(b64Gzip: string) {
  return strFromU8(gunzipSync(strToU8(atob(b64Gzip), true)))
}
