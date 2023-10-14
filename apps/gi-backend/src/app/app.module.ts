import type { ApolloDriverConfig } from '@nestjs/apollo'
import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SetResolver } from './set.resolver'
import { join } from 'path'
import { UserResolver } from './user.resolver'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // TODO: nestjs can also auto generate the schema file using decorators, might make thing easier? see `autoSchemaFile`
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'apps/gi-backend/src/app/graphql_gen.ts'),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SetResolver, UserResolver],
})
export class AppModule {}
