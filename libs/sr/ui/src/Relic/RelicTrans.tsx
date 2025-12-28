// use client due to hydration difference between client rendering and server in translation
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { Translate } from '@genshin-optimizer/sr/i18n'

export function RelicSetName({ setKey }: { setKey: RelicSetKey }) {
  return <Translate ns="relicNames_gen" key18={setKey} />
}

// export function RelicSlotName({ slotKey }: { slotKey: RelicSlotKey }) {
//   return <Translate ns="relic" key18={slotKey} />
// }

// export function RelicSetSlotName({
//   setKey,
//   slotKey,
// }: {
//   setKey: RelicSetKey
//   slotKey: RelicSlotKey
// }) {
//   return (
//     <Translate ns={`relic_${setKey}_gen`} key18={`pieces.${slotKey}.name`} />
//   )
// }

// export function RelicSetSlotDesc({
//   setKey,
//   slotKey,
// }: {
//   setKey: RelicSetKey
//   slotKey: RelicSlotKey
// }) {
//   return (
//     <Translate ns={`relic_${setKey}_gen`} key18={`pieces.${slotKey}.desc`} />
//   )
// }
