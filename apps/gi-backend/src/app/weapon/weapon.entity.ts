import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql'

@ObjectType()
export class Weapon {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => String)
  key: string

  @Field(() => Int)
  level: number

  @Field(() => Int)
  ascension: number

  @Field(() => Int)
  refinement: number

  @Field(() => String, { nullable: true })
  location: string | null

  @Field(() => Boolean)
  lock: boolean
}

@InputType()
export class InputWeapon extends OmitType(
  Weapon,
  ['id', 'genshinUserId'] as const,
  InputType
) {}

@InputType()
export class UpdateWeapon extends PartialType(InputWeapon) {
  @Field(() => ID)
  id: string
}
