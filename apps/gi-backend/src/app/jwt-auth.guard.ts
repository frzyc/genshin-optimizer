import type { ExecutionContext } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { GqlContextType } from '@nestjs/graphql'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from './_decorator/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }
  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) return true

    return super.canActivate(context)
  }

  // Must override getRequest to handle graphql context type
  override getRequest(context: ExecutionContext) {
    switch (context.getType<GqlContextType>()) {
      case 'graphql': {
        const ctx = GqlExecutionContext.create(context)
        return ctx.getContext().req
      }
      default: {
        // 'http' | 'ws' | 'rpc'
        return context.switchToHttp().getRequest()
      }
    }
  }
}
