import type { LocationCharacterKey } from '@genshin-optimizer/consts'
import { WeaponKey, allWeaponKeys } from '@genshin-optimizer/consts'
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
import { LocationEnum } from '../common.entity'

const WeaponKeyEnum = objKeyMap(allWeaponKeys, (k) => k)
registerEnumType(WeaponKeyEnum, {
  name: 'WeaponKey',
})

@ObjectType()
export class Weapon {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => WeaponKeyEnum)
  key: WeaponKey

  @Field(() => Int)
  level: number

  @Field(() => Int)
  ascension: number

  @Field(() => Int)
  refinement: number

  @Field(() => LocationEnum, { nullable: true })
  location: LocationCharacterKey | null

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
