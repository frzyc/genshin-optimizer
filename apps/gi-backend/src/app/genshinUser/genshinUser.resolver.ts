import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { GenshinUserService } from './genshinUser.service'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { UserService } from '../user/user.service'

@ObjectType()
export class GenshinUser {
  @Field(() => ID)
  id: string

  @Field(() => String)
  uid: string
}

@ObjectType()
export class AddGenshinUserRes {
  @Field(() => Boolean)
  success: boolean

  @Field(() => GenshinUser, { nullable: true })
  genshinUser?: GenshinUser

  @Field(() => String, { nullable: true })
  error?: string
}

@Resolver('User')
export class GenshinUserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly genshinUserService: GenshinUserService
  ) {}

  @Query(() => GenshinUser, { nullable: true })
  async getGenshinUser(@Args('id') id: string): Promise<GenshinUser | null> {
    return await this.genshinUserService.findOne(id)
  }

  @Query(() => GenshinUser, { nullable: true })
  async getGenshinUserByUid(
    @Args('uid') uid: string
  ): Promise<GenshinUser | null> {
    return await this.genshinUserService.findWithUID(uid)
  }

  @Mutation(() => AddGenshinUserRes)
  async addGenshinUser(
    @JWTUser('sub') userId: string,
    @Args('uid') uid: string
  ): Promise<AddGenshinUserRes> {
    console.log('addGenshinUser', { uid, userId })
    const user = await this.userService.findOne(userId)
    if (!user) return { success: false, error: 'Invalid User' }
    const existingGU = await this.genshinUserService.findWithUID(uid)
    if (existingGU) return { success: false, error: 'UID already registered' }
    console.log('addGenshinUser')
    const genshinUser = await this.genshinUserService.create(uid, userId)
    console.log({ genshinUser })

    console.log('newUser', { user: await this.userService.findOne(userId) })
    return { success: true, genshinUser }
  }
}
