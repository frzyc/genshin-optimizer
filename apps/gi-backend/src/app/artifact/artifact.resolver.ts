import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { JWTUser } from '../_decorator/jwtuser.decorator'
import { GenshinUserService } from '../genshinUser/genshinUser.service'
import { Artifact, InputArtifact, UpdateArtifact } from './artifact.entity'
import { ArtifactService } from './artifact.service'

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

  @Mutation(() => Artifact)
  async addArtifact(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('artifact', { type: () => InputArtifact })
    inputArtifact: InputArtifact
  ): Promise<Artifact> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    return this.artifactService.create(
      inputArtifact,
      genshinUserId
    ) as Promise<Artifact>
  }

  @Mutation(() => Artifact)
  async updateArtifact(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('artifact', { type: () => UpdateArtifact })
    updateArtifact: UpdateArtifact
  ): Promise<Artifact> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    const artifact = await this.artifactService.update(
      updateArtifact,
      genshinUserId
    )
    return artifact as Artifact
  }

  @Mutation(() => Artifact)
  async removeArtifact(
    @JWTUser('sub') userId: string,
    @Args('genshinUserId') genshinUserId: string,
    @Args('artifactId')
    artifactId: string
  ): Promise<Artifact> {
    this.genshinUserService.validateGenshinUser(userId, genshinUserId)
    const artifact = await this.artifactService.remove(
      artifactId,
      genshinUserId
    )
    return artifact as Artifact
  }
}
