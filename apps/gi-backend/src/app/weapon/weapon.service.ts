import { Injectable } from '@nestjs/common'
import type { Weapon } from '@prisma/client/gi'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WeaponService {
  constructor(private prisma: PrismaService) {}

  create(artiact: Omit<Weapon, 'id' | 'genshinUserId'>, genshinUserId: string) {
    // TODO: artifact validation
    return this.prisma.weapon.create({
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
    return this.prisma.weapon.findUnique({ where: { id } })
  }
  findAllUser(genshinUserId: string) {
    return this.prisma.weapon.findMany({ where: { genshinUserId } })
  }

  remove(id: string) {
    return this.prisma.weapon.delete({ where: { id } })
  }
}
