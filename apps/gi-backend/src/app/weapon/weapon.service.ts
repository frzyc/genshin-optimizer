import { Injectable } from '@nestjs/common'
import type { Weapon } from '@prisma/client/gi'
import { GraphQLError } from 'graphql'
import { PrismaService } from '../prisma/prisma.service'
import type { UpdateWeapon } from './weapon.entity'

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

  remove(id: string, genshinUserId: string) {
    return this.prisma.weapon.delete({ where: { id, genshinUserId } })
  }
  async update(weapon: UpdateWeapon, genshinUserId: string) {
    if (weapon.location) {
      // TODO: this doesnt validate weapon type vs character weapon type.
      const oldWeapon = await this.prisma.weapon.findUnique({
        where: { id: weapon.id },
      })
      if (!oldWeapon) throw new GraphQLError('Weapon does not exist')
      if (oldWeapon.location !== weapon.location && weapon.location) {
        // update other weapon that could be equipped to the same char
        const where = {
          genshinUserId_location: {
            genshinUserId,
            location: weapon.location,
          },
        }
        const conflictWeapon = await this.prisma.weapon.findUnique({ where })
        if (conflictWeapon)
          await this.prisma.weapon.update({
            where,
            data: {
              location: oldWeapon.location,
            },
          })
      }
    }
    const { id, ...data } = weapon
    return this.prisma.weapon.update({
      where: { id, genshinUserId },
      data,
    })
  }
}
