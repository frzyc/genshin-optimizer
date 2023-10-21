import {
  Args,
  Field,
  Float,
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
import { ArtifactService } from './artifact.service'

@ObjectType()
export class Artifact {
  @Field(() => ID)
  id: string

  @Field(() => String)
  genshinUserId: string

  @Field(() => String)
  setKey: string

  @Field(() => String)
  slotKey: string

  @Field(() => Int)
  level: number

  @Field(() => Int)
  rarity: number

  @Field(() => String)
  mainStatKey: string

  @Field(() => String)
  location: string

  @Field(() => Boolean)
  lock: boolean

  @Field(() => [Substat])
  substats: Substat[]
}

@ObjectType()
class Substat {
  @Field(() => String)
  key: string

  @Field(() => Float)
  value: number
}

@InputType()
class InputSubstat {
  @Field(() => String)
  key: string

  @Field(() => Float)
  value: number
}

@InputType()
export class InputArtifact extends OmitType(
  Artifact,
  ['id', 'genshinUserId', 'substats'] as const,
  InputType
) {
  @Field(() => [InputSubstat])
  substats: InputSubstat[]
}

@ObjectType()
export class AddArtifactRes {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Artifact, { nullable: true })
  artifact?: Artifact

  @Field(() => String, { nullable: true })
  error?: string
}

@Resolver(() => Artifact)
export class ArtifactResolver {
  constructor(
    private readonly genshinUserService: GenshinUserService,
    private readonly artifactService: ArtifactService
  ) {}

  @Query(() => Artifact, { nullable: true })
  async getArtifact(@Args('id') id: string) {
    return await this.artifactService.findOne(id)
  }

  @Query(() => [Artifact])
  async getAllUserArtifact(@Args('genshinUserId') genshinUserId: string) {
    return await this.artifactService.findAllUser(genshinUserId)
  }

  @Mutation(() => AddArtifactRes)
  async addArtifact(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('artifact', { type: () => InputArtifact })
    inputArtifact: InputArtifact
  ): Promise<AddArtifactRes> {
    const genshinUser = await this.genshinUserService.findOne(genshinUserId)
    if (!genshinUser) return { success: false, error: 'Invalid User' }
    if (genshinUser.userId !== userId)
      return { success: false, error: 'User does not own UID' }
    const artifact = await this.artifactService.create(
      inputArtifact,
      genshinUserId
    )
    return { success: true, artifact }
  }
}
