import { h64 } from 'xxhashjs'
// Convert un-hashed string in datamine to a textmap hash
// RelicDesc_1012 -> 769181229
// This can later be used as 769181229 -> (TextMapEN.json) -> "Increases Outgoing Healing by <unbreak>#1[i]%</unbreak>."
export function convertToHash(str: string) {
  return h64(str, 0).toString()
}
