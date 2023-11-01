import { Injectable } from '@nestjs/common'
import type { Character } from '@prisma/client/gi'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CharacterService {
  constructor(private prisma: PrismaService) {}

  create(
    character: Omit<Character, 'id' | 'genshinUserId'>,
    genshinUserId: string
  ) {
    const data = {
      ...character,
      genshinUser: {
        connect: {
          id: genshinUserId,
        },
      },
    }
    return this.prisma.character.upsert({
      where: {
        genshinUserId_key: {
          genshinUserId,
          key: character.key,
        },
      },
      create: data,
      update: data,
    })
  }
  findOne(id: string) {
    return this.prisma.character.findUnique({ where: { id } })
  }
  findAllUser(genshinUserId: string) {
    return this.prisma.character.findMany({ where: { genshinUserId } })
  }

  remove(id: string) {
    return this.prisma.character.delete({ where: { id } })
  }
}
