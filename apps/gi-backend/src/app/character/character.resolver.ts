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
import { CharacterService } from './character.service'

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

  @Field(() => String)
  key: string

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

@ObjectType()
export class AddCharacterRes {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Character, { nullable: true })
  character?: Character

  @Field(() => String, { nullable: true })
  error?: string
}

@Resolver(() => Character)
export class CharacterResolver {
  constructor(
    private readonly genshinUserService: GenshinUserService,
    private readonly characterService: CharacterService
  ) {}

  @Query(() => Character, { nullable: true })
  async getCharacter(@Args('id') id: string) {
    return await this.characterService.findOne(id)
  }

  @Query(() => [Character])
  async getAllUserCharacter(@Args('genshinUserId') genshinUserId: string) {
    return await this.characterService.findAllUser(genshinUserId)
  }

  @Mutation(() => AddCharacterRes)
  async addCharacter(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('character', { type: () => InputCharacter })
    inputCharacter: InputCharacter
  ): Promise<AddCharacterRes> {
    const genshinUser = await this.genshinUserService.findOne(genshinUserId)
    if (!genshinUser) return { success: false, error: 'Invalid User' }
    if (genshinUser.userId !== userId)
      return { success: false, error: 'User does not own UID' }
    const character = await this.characterService.create(
      inputCharacter,
      genshinUserId
    )
    return { success: true, character }
  }
}
