import {
  Args,
  Field,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  OmitType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { GenshinUserService } from '../genshinUser/genshinUser.service'
import { WeaponService } from './weapon.service'

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

  @Field(() => String)
  location: string

  @Field(() => Boolean)
  lock: boolean
}

@InputType()
export class InputWeapon extends OmitType(
  Weapon,
  ['id', 'genshinUserId'] as const,
  InputType
) {}

@ObjectType()
export class AddWeaponRes {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Weapon, { nullable: true })
  weapon?: Weapon

  @Field(() => String, { nullable: true })
  error?: string
}

@Resolver(() => Weapon)
export class WeaponResolver {
  constructor(
    private readonly genshinUserService: GenshinUserService,
    private readonly weaponService: WeaponService
  ) {}

  @Query(() => Weapon, { nullable: true })
  async getWeapon(@Args('id') id: string) {
    return await this.weaponService.findOne(id)
  }

  @Query(() => [Weapon])
  async getAllUserWeapon(@Args('genshinUserId') genshinUserId: string) {
    return await this.weaponService.findAllUser(genshinUserId)
  }

  @Mutation(() => AddWeaponRes)
  async addWeapon(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('weapon', { type: () => InputWeapon })
    inputWeapon: InputWeapon
  ): Promise<AddWeaponRes> {
    const genshinUser = await this.genshinUserService.findOne(genshinUserId)
    if (!genshinUser) return { success: false, error: 'Invalid User' }
    if (genshinUser.userId !== userId)
      return { success: false, error: 'User does not own UID' }
    const weapon = await this.weaponService.create(inputWeapon, genshinUserId)
    return { success: true, weapon }
  }
}
