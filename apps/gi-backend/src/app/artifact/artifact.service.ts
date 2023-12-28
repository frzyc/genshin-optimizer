import { Injectable } from '@nestjs/common'
import type { Artifact } from '@prisma/client/gi'
import { PrismaService } from '../prisma/prisma.service'
import { GraphQLError } from 'graphql'
import type { UpdateArtifact } from './artifact.entity'

@Injectable()
export class ArtifactService {
  constructor(private prisma: PrismaService) {}

  create(
    artiact: Omit<Artifact, 'id' | 'genshinUserId'>,
    genshinUserId: string
  ) {
    // TODO: artifact validation
    return this.prisma.artifact.create({
      data: {
        ...artiact,
        genshinUser: {
          connect: {
            id: genshinUserId,
          },
        },
      },
    })
  }
  findOne(id: string) {
    return this.prisma.artifact.findUnique({ where: { id } })
  }
  findAllUser(genshinUserId: string) {
    return this.prisma.artifact.findMany({ where: { genshinUserId } })
  }

  remove(id: string, genshinUserId: string) {
    return this.prisma.artifact.delete({ where: { id, genshinUserId } })
  }
  async update(art: UpdateArtifact, genshinUserId: string) {
    if (art.location) {
      const oldArt = await this.prisma.artifact.findUnique({
        where: { id: art.id },
      })
      if (!oldArt) throw new GraphQLError('Artifact does not exist')
      if (oldArt.location !== art.location && art.location) {
        // update other artifact that could be equipped to the same char in the same slot
        const where = {
          genshinUserId_slotKey_location: {
            genshinUserId,
            slotKey: art.slotKey ?? oldArt.slotKey,
            location: art.location,
          },
        }
        const conflictArt = await this.prisma.artifact.findUnique({ where })
        if (conflictArt)
          await this.prisma.artifact.update({
            where,
            data: {
              // in corner case where both location and slot is updated, just set conflict to inventory
              location: art.slotKey === oldArt.slotKey ? oldArt.location : null,
            },
          })
      }
    }
    const { id, ...data } = art
    return this.prisma.artifact.update({
      where: { id, genshinUserId },
      data,
    })
  }
}
