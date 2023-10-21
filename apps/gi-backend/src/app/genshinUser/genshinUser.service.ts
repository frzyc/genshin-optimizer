import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

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
}
