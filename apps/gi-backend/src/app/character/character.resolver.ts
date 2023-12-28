import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { GenshinUserService } from '../genshinUser/genshinUser.service'
import { CharacterService } from './character.service'
import { Character, InputCharacter, UpdateCharacter } from './character.entity'

@Resolver(() => Character)
export class CharacterResolver {
  constructor(
    private readonly genshinUserService: GenshinUserService,
    private readonly characterService: CharacterService
  ) {}

  @Query(() => Character, { nullable: true })
  async getCharacter(@Args('id') id: string) {
    return this.characterService.findOne(id)
  }

  @Query(() => [Character])
  async getAllUserCharacter(@Args('genshinUserId') genshinUserId: string) {
    return this.characterService.findAllUser(genshinUserId)
  }

  @Mutation(() => Character)
  async addCharacter(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('character', { type: () => InputCharacter })
    inputCharacter: InputCharacter
  ): Promise<Character> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.characterService.create(
      inputCharacter,
      genshinUserId
    ) as Promise<Character>
  }
  @Mutation(() => Character)
  async updateCharacter(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('character', { type: () => UpdateCharacter })
    updateCharacter: UpdateCharacter
  ): Promise<Character> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    const character = await this.characterService.update(
      updateCharacter,
      genshinUserId
    )
    return character as Character
  }

  @Mutation(() => Character)
  async removeCharacter(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('characterId')
    characterId: string
  ): Promise<Character> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.characterService.remove(
      characterId,
      genshinUserId
    ) as Promise<Character>
  }
}
