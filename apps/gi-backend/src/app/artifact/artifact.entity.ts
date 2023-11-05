import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql'
@ObjectType()
export class Artifact {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => String)
  setKey: string

  @Field(() => String)
  slotKey: string

  @Field(() => Int)
  level: number

  @Field(() => Int)
  rarity: number

  @Field(() => String)
  mainStatKey: string

  @Field(() => String, { nullable: true })
  location: string | null

  @Field(() => Boolean)
  lock: boolean

  @Field(() => [Substat])
  substats: Substat[]
}

@ObjectType()
class Substat {
  @Field(() => String)
  key: string

  @Field(() => Float)
  value: number
}

@InputType()
class InputSubstat {
  @Field(() => String)
  key: string

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
