import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { GraphQLError } from 'graphql'

@Injectable()
export class GenshinUserService {
  constructor(private prisma: PrismaService) {}

  create(uid: string, userId: string) {
    return this.prisma.genshinUser.create({
      data: {
        uid,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }
  findOne(id: string) {
    return this.prisma.genshinUser.findUnique({ where: { id } })
  }

  findWithUID(uid: string) {
    return this.prisma.genshinUser.findUnique({ where: { uid } })
  }

  remove(id: string) {
    return this.prisma.genshinUser.delete({ where: { id } })
  }
  async validateGenshinUser(loggedInUserId: string, genshinUserId: string) {
    const genshinUser = await this.findOne(genshinUserId)
    if (!genshinUser) throw new GraphQLError('Invalid GenshinUser')
    if (genshinUser.userId !== loggedInUserId)
      throw new GraphQLError('User does not own UID')
  }
}
