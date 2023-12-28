import type { ApolloDriverConfig } from '@nestjs/apollo'
import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { JwtModule } from '@nestjs/jwt'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { JwtStrategy } from './jwt.strategy'
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module'
import { GenshinUserModule } from './genshinUser/genshinUser.module'
import { ArtifactModule } from './artifact/artifact.module'
import { WeaponModule } from './weapon/weapon.module'
import { CharacterModule } from './character/character.module'

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env['APP_JWT_SECRET'] ?? '',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Auto generate graphql definition using resolvers
      autoSchemaFile: join(
        process.cwd(),
        'apps/gi-backend/src/app/schema_gen.graphql'
      ),
      context: ({ req }: any) => {
        req
      },
      definitions: {
        path: join(process.cwd(), 'apps/gi-backend/src/app/graphql_gen.ts'),
      },
    }),

    // custom modules
    UserModule,
    GenshinUserModule,
    ArtifactModule,
    WeaponModule,
    CharacterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
