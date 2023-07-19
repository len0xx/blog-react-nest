import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { IncomingMessage } from 'http'
import * as jwt from 'jsonwebtoken'
import UserDto from './user.dto'
import { UserService } from './user.service'
import { PrismaService } from './prisma.service'

const AUTH_SECRET = process.env.AUTH_SECRET

@Injectable()
export class AuthGuard implements CanActivate {
    getUserService(): UserService {
        const prismaService = new PrismaService()
        return new UserService(prismaService)
    }

    validateToken(token: string): UserDto {
        try {
            const payload = jwt.verify(token, AUTH_SECRET) as UserDto
            if (!payload) throw new ForbiddenException()
            return payload
        }
        catch (e) {
            console.error(e)
            throw new ForbiddenException('You don\'t have access to this resource')
        }
    }

    validateUser(user: UserDto): boolean {
        return user.id === 1
    }

    async canActivate(
        context: ExecutionContext
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest<IncomingMessage>()
        const userService = this.getUserService()

        const token = request.headers.authorization
        if (!token) {
            throw new ForbiddenException('You don\'t have access to this resource')
        }

        const payload = this.validateToken(token)
        const id = payload.id
        const user = await userService.get({ id })

        if (this.validateUser(user)) {
            return true
        }
        else {
            throw new ForbiddenException('You don\'t have access to this resource')
        }
    }
}
