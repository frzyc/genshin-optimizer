import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { GenshinUserService } from '../genshinUser/genshinUser.service'
import { InputWeapon, UpdateWeapon, Weapon } from './weapon.entity'
import { WeaponService } from './weapon.service'

@Resolver(() => Weapon)
export class WeaponResolver {
  constructor(
    private readonly genshinUserService: GenshinUserService,
    private readonly weaponService: WeaponService
  ) {}

  @Query(() => Weapon, { nullable: true })
  async getWeapon(@Args('id') id: string) {
    return this.weaponService.findOne(id)
  }

  @Query(() => [Weapon])
  async getAllUserWeapon(@Args('genshinUserId') genshinUserId: string) {
    return this.weaponService.findAllUser(genshinUserId)
  }

  @Mutation(() => Weapon)
  async addWeapon(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('weapon', { type: () => InputWeapon })
    inputWeapon: InputWeapon
  ): Promise<Weapon> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.weaponService.create(inputWeapon, genshinUserId)
  }

  @Mutation(() => Weapon)
  async updateWeapon(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('weapon', { type: () => UpdateWeapon })
    updateWeapon: UpdateWeapon
  ): Promise<Weapon> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.weaponService.update(updateWeapon, genshinUserId)
  }

  @Mutation(() => Weapon)
  async removeWeapon(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('weaponId')
    weaponId: string
  ): Promise<Weapon> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.weaponService.remove(weaponId, genshinUserId)
  }
}
