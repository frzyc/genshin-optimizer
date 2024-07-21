'use client'
// use client due to hydration difference between client rendering and server in translation
import type {
  ArtifactSetKey,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'

export function ArtifactSetSlotName({
  setKey,
  slotKey,
}: {
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
}) {
  return (
    <Translate ns={`artifact_${setKey}_gen`} key18={`pieces.${slotKey}.name`} />
  )
}

export function ArtifactSetSlotDesc({
  setKey,
  slotKey,
}: {
  setKey: ArtifactSetKey
  slotKey: ArtifactSlotKey
}) {
  return (
    <Translate ns={`artifact_${setKey}_gen`} key18={`pieces.${slotKey}.desc`} />
  )
}

export function ArtifactSetName({ setKey }: { setKey: ArtifactSetKey }) {
  return <Translate ns="artifactNames_gen" key18={setKey} />
}

export function ArtifactSlotName({ slotKey }: { slotKey: ArtifactSlotKey }) {
  return <Translate ns="artifact" key18={`slotName.${slotKey}`} />
}
