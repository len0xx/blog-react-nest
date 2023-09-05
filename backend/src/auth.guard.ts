import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common'
import { IncomingMessage } from 'http'
import { UserRole, UserRoleEnum } from './user.dto'
import { decodeToken } from './auth.utilities'
import { ExtendedUser } from './user.service'

const extractAuthHeader = (request: IncomingMessage) => {
    const token = request.headers.authorization
    if (!token) {
        throw new UnauthorizedException('You must authorize first')
    }
    return token
}

@Injectable()
export class AuthGuard implements CanActivate {
    private defaultException = new ForbiddenException('You don\'t have access to this resource')

    public constructor(private privilegedRoles = [ UserRoleEnum.USER, UserRoleEnum.AUTHOR, UserRoleEnum.ADMIN ] as UserRole[]) {}

    private validateUserRole(user: ExtendedUser): boolean {
        return this.privilegedRoles.includes(user.role)
    }

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<IncomingMessage>()
        const token = extractAuthHeader(request)
        const user = await decodeToken(token)

        if (user && this.validateUserRole(user)) {
            return true
        }
        else {
            throw this.defaultException
        }
    }
}
