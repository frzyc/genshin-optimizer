import type { ArtifactSetKey, ArtifactSlotKey } from '@genshin-optimizer/consts'
import { Translate } from '../Translate'

export function ArtifactSlotName({
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

export function ArtifactSlotDesc({
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
