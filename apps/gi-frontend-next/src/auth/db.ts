// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
import { PrismaClient } from '@prisma/client/gi' // Using the client generated from libs\gi-prisma-schema

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  let prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
