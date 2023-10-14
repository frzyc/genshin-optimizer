import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import type { CreateUserNameResponse, User } from './graphql_gen'

@Resolver('User')
export class UserResolver {
  // private prisma = new this.prisma

  @Query('searchUsers')
  searchUsers(@Args('username') username: string): User[] {
    console.log('searchUsers', { username })
    return []
  }

  @Mutation('createUsername')
  createUsername(@Args('username') username: string) {
    console.log('createUsername', { username })
    return {
      success: true,
    } as CreateUserNameResponse
  }
}
