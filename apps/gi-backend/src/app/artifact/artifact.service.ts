import { Injectable } from '@nestjs/common'
import type { Artifact } from '@prisma/client/gi'
import { PrismaService } from '../prisma/prisma.service'

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
}
