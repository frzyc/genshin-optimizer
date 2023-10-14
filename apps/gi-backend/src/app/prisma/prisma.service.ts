import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client/gi'

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env['MONGODB_URI'] ?? '',
        },
      },
    })
  }
}
