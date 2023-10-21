import { Module } from '@nestjs/common'
import { GenshinUserModule } from '../genshinUser/genshinUser.module'
import { ArtifactResolver } from './artifact.resolver'
import { ArtifactService } from './artifact.service'

@Module({
  imports: [GenshinUserModule],
  providers: [ArtifactResolver, ArtifactService],
  exports: [ArtifactService],
})
export class ArtifactModule {}
