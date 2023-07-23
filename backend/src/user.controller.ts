import { BadRequestException, Body, Controller, Header, Post, UnauthorizedException } from "@nestjs/common"
import { UserService } from "./user.service"
import { CreateUser } from "./user.service"
import { compare, hash } from 'bcrypt'
import * as jwt from 'jsonwebtoken'

const NEST_ACCESS_TOKEN = process.env.NEST_ACCESS_TOKEN as string
const NEST_AUTH_SECRET = process.env.AUTH_SECRET as string

type CreateUserBody = CreateUser & { passwordRepeat: string }

@Controller('api/user')
export class UserController {
    constructor( private readonly userService: UserService ) {}

    @Post('create')
    @Header('Content-Type', 'application/json')
    async create(@Body() data: CreateUserBody): Promise<string> {
        if (!data.email || !data.firstName || !data.lastName || !data.password || !data.passwordRepeat) {
            throw new BadRequestException('Fields "email", "firstName", "lastName" and "password" are required')
        }

        const existingUser = await this.userService.getByEmail(data.email)
        if (existingUser) {
            throw new BadRequestException('User with this email already exists')
        }

        if (data.password !== data.passwordRepeat) {
            throw new BadRequestException('Passwords don\'t match')
        }

        data.password = await hash(data.password, 14)

        try {
            const user = {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName
            }
            await this.userService.create(user)
            return JSON.stringify({ created: true })
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('Could not create a new user')
        }
    }

    @Post('auth')
    @Header('Content-Type', 'application/json')
    async auth(@Body() data: { email?: string, password?: string, token?: string }): Promise<string> {
        if (!data.email || !data.password) {
            throw new BadRequestException('Invalid "email" or "password"')
        }

        if (!data.token || data.token !== NEST_ACCESS_TOKEN) {
            throw new UnauthorizedException('Unauthorized application')
        }

        const user = await this.userService.getByEmail(data.email)
        if (!user) throw new BadRequestException('Invalid "email" or "password"')

        const match = await compare(data.password, user.password)
        if (!match) throw new BadRequestException('Invalid "email" or "password"')

        const payload: Record<string, string | number> = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName
        }
        const token = jwt.sign(payload, NEST_AUTH_SECRET, { expiresIn: 7 * 24 * 60 * 60 })
        payload.backendToken = token
        return JSON.stringify(payload)
    }
}
