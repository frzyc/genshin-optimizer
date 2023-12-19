import { Module } from '@nestjs/common'
import { GenshinUserResolver } from './genshinUser.resolver'
import { GenshinUserService } from './genshinUser.service'
import { UserModule } from '../user/user.module'

@Module({
  imports: [UserModule],
  providers: [GenshinUserResolver, GenshinUserService],
  exports: [GenshinUserService],
})
export class GenshinUserModule {}
