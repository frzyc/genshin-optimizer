import type { ExecutionContext } from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const JWTUser = createParamDecorator(
  async (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context)
    const { req } = ctx.getContext()
    const user = req.user
    return data ? user?.[data] : user
  }
)
