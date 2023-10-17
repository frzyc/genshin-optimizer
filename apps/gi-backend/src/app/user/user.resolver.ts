import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { UserService } from './user.service'
import { GenshinUser } from '../genshinUser/genshinUser.resolver'

@ObjectType()
export class CreateUserNameResponse {
  @Field()
  success: boolean

  @Field({ nullable: true })
  error?: string
}

@ObjectType()
export class User {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  username: string | null

  @Field(() => [GenshinUser], { nullable: true })
  genshinUsers: GenshinUser[]
}

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async getUserById(@Args('id') userId: string): Promise<User | null> {
    return await this.userService.findOne(userId)
  }

  @Query(() => [User])
  searchUsers(@Args('username') username: string): User[] {
    console.log('searchUsers', { username })
    // TODO: Implementation
    return []
  }

  @Mutation(() => CreateUserNameResponse)
  async createUsername(
    @JWTUser('sub') id: string,
    @Args('username') username: string
  ): Promise<CreateUserNameResponse> {
    if (!id) return { success: false, error: 'Not Authorized' }
    // TODO: username validation
    const user = await this.userService.findWithUserName(username)
    if (user?.id === id && user?.username === username) {
      return {
        success: true,
      }
    }
    if (user) return { success: false, error: 'Username already exists' }
    await this.userService.setUsername(id, username)
    return {
      success: true,
    }
  }
}
