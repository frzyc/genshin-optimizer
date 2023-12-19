import { Injectable } from '@nestjs/common'
import type { Character } from '@prisma/client/gi'
import { PrismaService } from '../prisma/prisma.service'
import type { UpdateCharacter } from './character.entity'
import { GraphQLError } from 'graphql'

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

  async remove(id: string, genshinUserId: string) {
    const char = await this.prisma.character.findUnique({
      where: { id, genshinUserId },
    })
    if (!char) throw new GraphQLError('Character does not exist')
    this.prisma.artifact.updateMany({
      where: { location: { equals: char.key } },
      data: {
        location: null,
      },
    })
    this.prisma.weapon.updateMany({
      where: { location: { equals: char.key } },
      data: {
        location: null,
      },
    })
    return this.prisma.character.delete({ where: { id, genshinUserId } })
  }
  async update(char: UpdateCharacter, genshinUserId: string) {
    const { id, ...data } = char
    return this.prisma.character.update({
      where: { id, genshinUserId },
      data,
    })
  }
}
