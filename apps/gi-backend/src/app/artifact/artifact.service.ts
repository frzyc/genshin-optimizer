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

  remove(id: string) {
    return this.prisma.artifact.delete({ where: { id } })
  }
  async update(art: UpdateArtifact) {
    // if (art.location) {
    //   const oldArt = await this.prisma.artifact.findUnique({
    //     where: { id: art.id },
    //   })
    //   if (!oldArt) throw new GraphQLError('Artifact does not exist')
    //   if (oldArt.location !== art.location && oldArt.location) {
    //     // update other artifacts that could be equipped to the same char in the same slot
    //     await this.prisma.artifact.updateMany({
    //       where: {
    //         id: {
    //           not: art.id,
    //         },
    //         slotKey: art.slotKey ?? oldArt.slotKey,
    //         location: oldArt.location,
    //       },
    //       data: {
    //         location: null,
    //       },
    //     })
    //   }
    // }
    return this.prisma.artifact.update({ where: { id: art.id }, data: art })
  }
}
