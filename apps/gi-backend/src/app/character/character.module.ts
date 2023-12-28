import { Module } from '@nestjs/common'
import { GenshinUserModule } from '../genshinUser/genshinUser.module'
import { CharacterResolver } from './character.resolver'
import { CharacterService } from './character.service'

@Module({
  imports: [GenshinUserModule],
  providers: [CharacterResolver, CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
