import * as jwt from 'jsonwebtoken'
import { User } from "@prisma/client"
import { ExtendedUser, UserService } from './user.service'
import { PrismaService } from './prisma.service'
import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import UserDto from './user.dto'
import { IncomingMessage } from 'http'

const AUTH_SECRET = process.env.AUTH_SECRET

export async function decodeToken(token: string): Promise<ExtendedUser | null> {
    const prismaService = new PrismaService()
    const userService = new UserService(prismaService)

    try {
        const payload = jwt.verify(token, AUTH_SECRET!) as UserDto
        const user = await userService.get({ id: payload.id })
        return user || null
    }
    catch (e) {
        return null
    }
}

export const Authorization = createParamDecorator(
    async (
        _data: unknown,
        ctx: ExecutionContext
    ): Promise<User | null> => {
        const request = ctx.switchToHttp().getRequest() as IncomingMessage
        const { authorization: accessToken } = request.headers

        try {
            const user = await decodeToken(accessToken)
            delete user.password
            return user
        } catch (e) {
            return null
        }
    }
)
