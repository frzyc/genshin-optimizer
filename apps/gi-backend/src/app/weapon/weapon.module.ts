import { Module } from '@nestjs/common'
import { GenshinUserModule } from '../genshinUser/genshinUser.module'
import { WeaponResolver } from './weapon.resolver'
import { WeaponService } from './weapon.service'

@Module({
  imports: [GenshinUserModule],
  providers: [WeaponResolver, WeaponService],
  exports: [WeaponService],
})
export class WeaponModule {}
