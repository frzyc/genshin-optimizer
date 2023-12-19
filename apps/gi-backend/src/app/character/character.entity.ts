import { CharacterKey, allCharacterKeys } from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PartialType,
  registerEnumType,
} from '@nestjs/graphql'

const CharacterEnum = objKeyMap(allCharacterKeys, (k) => k)
registerEnumType(CharacterEnum, {
  name: 'CharacterKey',
})

@ObjectType()
class Talent {
  @Field(() => Int)
  auto: number

  @Field(() => Int)
  skill: number

  @Field(() => Int)
  burst: number
}

@ObjectType()
export class Character {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => CharacterEnum)
  key: CharacterKey

  @Field(() => Int)
  level: number

  @Field(() => Int)
  ascension: number

  @Field(() => Int)
  constellation: number

  @Field(() => Talent)
  talent: Talent
}

@InputType()
class InputTalent {
  @Field(() => Int)
  auto: number

  @Field(() => Int)
  skill: number

  @Field(() => Int)
  burst: number
}

@InputType()
export class InputCharacter extends OmitType(
  Character,
  ['id', 'genshinUserId', 'talent'] as const,
  InputType
) {
  @Field(() => InputTalent)
  talent: InputTalent
}

@InputType()
export class UpdateCharacter extends PartialType(
  OmitType(InputCharacter, ['key']) // Cannot change the key
) {
  @Field(() => ID)
  id: string
}
