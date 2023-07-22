import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { IncomingMessage } from 'http'
import UserDto, { UserRole, UserRoleEnum } from './user.dto'
import { decodeToken } from './auth.utilities'

@Injectable()
export class AuthGuard implements CanActivate {
    private privilegedRoles = [ UserRoleEnum.ADMIN ] as UserRole[]
    private defaultException = new ForbiddenException('You don\'t have access to this resource')

    private validateUserRole(user: UserDto): boolean {
        return this.privilegedRoles.includes(user.role)
    }

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<IncomingMessage>()

        const token = request.headers.authorization
        if (!token) {
            throw this.defaultException
        }

        const user = await decodeToken(token)

        if (user && this.validateUserRole(user)) {
            return true
        }
        else {
            throw this.defaultException
        }
    }
}
