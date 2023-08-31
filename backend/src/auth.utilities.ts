import * as jwt from 'jsonwebtoken'
import { ExtendedUser, FullUser, UserService } from './user.service'
import { PrismaService } from './prisma.service'
import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import UserDto from './user.dto'
import { IncomingMessage } from 'http'

const AUTH_SECRET = process.env.AUTH_SECRET

export async function decodeToken(token: string): Promise<FullUser | null> {
    const prismaService = new PrismaService()
    const userService = new UserService(prismaService)

    try {
        const payload = jwt.verify(token, AUTH_SECRET!) as UserDto
        const user = await userService.get({ id: payload.id }) as FullUser
        return user || null
    }
    catch (e) {
        return null
    }
}

export const Authorization = createParamDecorator(
    async (
        { sanitize }: { sanitize: boolean } = { sanitize: true },
        ctx: ExecutionContext
    ): Promise<ExtendedUser | null> => {
        const request = ctx.switchToHttp().getRequest() as IncomingMessage
        const { authorization: accessToken } = request.headers

        try {
            const user = await decodeToken(accessToken)
            if (sanitize) delete user.password
            return user
        } catch (e) {
            return null
        }
    }
)
