'use client'
// use client due to hydration difference between client rendering and server in translation
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { Translate } from '@genshin-optimizer/zzz/i18n'

export function DiscSetName({ setKey }: { setKey: DiscSetKey }) {
  return setKey
  // TODO:
  return <Translate ns="discNames_gen" key18={setKey} />
}

// export function DiscSlotName({ slotKey }: { slotKey: DiscSlotKey }) {
//   return <Translate ns="disc" key18={slotKey} />
// }

// export function DiscSetSlotName({
//   setKey,
//   slotKey,
// }: {
//   setKey: DiscSetKey
//   slotKey: DiscSlotKey
// }) {
//   return (
//     <Translate ns={`disc_${setKey}_gen`} key18={`pieces.${slotKey}.name`} />
//   )
// }

// export function DiscSetSlotDesc({
//   setKey,
//   slotKey,
// }: {
//   setKey: DiscSetKey
//   slotKey: DiscSlotKey
// }) {
//   return (
//     <Translate ns={`disc_${setKey}_gen`} key18={`pieces.${slotKey}.desc`} />
//   )
// }
