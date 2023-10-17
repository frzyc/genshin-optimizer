import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { genshinUsers: true },
    })
  }
  findWithUserName(username: string) {
    return this.prisma.user.findUnique({ where: { username } })
  }
  setUsername(id: string, username: string) {
    return this.prisma.user.update({
      where: { id },
      data: { username },
    })
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }
}
