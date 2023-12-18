import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql'

import type { LocationCharacterKey } from '@genshin-optimizer/consts'
import {
  ArtifactSetKey,
  ArtifactSlotKey,
  SubstatKey,
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allMainStatKeys,
  allSubstatKeys,
  MainStatKey,
} from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import { LocationEnum } from '../common.entity'

const ArtifactSetEnum = objKeyMap(allArtifactSetKeys, (k) => k)
registerEnumType(ArtifactSetEnum, {
  name: 'ArtifactSetKey',
})

const ArtifactSlotEnum = objKeyMap(allArtifactSlotKeys, (k) => k)
registerEnumType(ArtifactSlotEnum, {
  name: 'ArtifactSlotKey',
})

const MainStatEnum = objKeyMap(allMainStatKeys, (k) => k)
registerEnumType(MainStatEnum, {
  name: 'MainStatKey',
})

const SubstatEnum = objKeyMap(allSubstatKeys, (k) => k)
registerEnumType(SubstatEnum, {
  name: 'SubstatKey',
})

@ObjectType()
export class Artifact {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => ArtifactSetEnum)
  setKey: ArtifactSetKey

  @Field(() => ArtifactSlotEnum)
  slotKey: ArtifactSlotKey

  @Field(() => Int)
  level: number

  @Field(() => Int)
  rarity: number

  @Field(() => MainStatEnum)
  mainStatKey: MainStatKey

  @Field(() => LocationEnum, { nullable: true })
  location: LocationCharacterKey | null

  @Field(() => Boolean)
  lock: boolean

  @Field(() => [Substat])
  substats: Substat[]
}

@ObjectType()
class Substat {
  @Field(() => SubstatEnum)
  key: SubstatKey

  @Field(() => Float)
  value: number
}

@InputType()
class InputSubstat {
  @Field(() => SubstatEnum)
  key: SubstatKey

  @Field(() => Float)
  value: number
}

@InputType()
export class InputArtifact extends OmitType(
  Artifact,
  ['id', 'genshinUserId', 'substats'] as const,
  InputType
) {
  @Field(() => [InputSubstat])
  substats: InputSubstat[]
}

@InputType()
export class UpdateArtifact extends PartialType(InputArtifact) {
  @Field(() => ID)
  id: string
}
