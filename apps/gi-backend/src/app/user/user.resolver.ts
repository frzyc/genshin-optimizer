import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import type { CreateUserNameResponse, User as GQLUser } from '../graphql_gen'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('searchUsers')
  searchUsers(@Args('username') username: string): GQLUser[] {
    console.log('searchUsers', { username })
    return []
  }

  @Mutation('createUsername')
  async createUsername(
    @JWTUser('sub') id: string,
    @Args('username') username: string
  ): Promise<CreateUserNameResponse> {
    if (!id) return { success: false, error: 'Not Authorized' }
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
