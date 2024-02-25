import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { GenshinUserResolver } from './genshinUser.resolver'
import { GenshinUserService } from './genshinUser.service'

@Module({
  imports: [UserModule],
  providers: [GenshinUserResolver, GenshinUserService],
  exports: [GenshinUserService],
})
export class GenshinUserModule {}
