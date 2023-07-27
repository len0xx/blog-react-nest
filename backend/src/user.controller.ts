import { BadRequestException, Body, Controller, Get, Header, Patch, Post, UnauthorizedException } from "@nestjs/common"
import { UserService } from "./user.service"
import { CreateUser } from "./user.service"
import { compare, hash } from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Authorization } from "./auth.utilities"
import { User } from "@prisma/client"

const NEST_ACCESS_TOKEN = process.env.NEST_ACCESS_TOKEN as string
const NEST_AUTH_SECRET = process.env.AUTH_SECRET as string

type CreateUserBody = CreateUser & { passwordRepeat: string }
type UpdateUserBody = {
    firstName: string
    lastName: string
    about: string
}

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

    @Patch('update')
    @Header('Content-Type', 'application/json')
    async update(@Body() data: UpdateUserBody, @Authorization() user: User): Promise<string> {
        if (!data.firstName && !data.lastName && !data.about) {
            throw new BadRequestException('Missing data ("firstName", "lastName" and "about")')
        }

        if (!user) {
            throw new UnauthorizedException('You must authorize first to access this resource')
        }

        const userId = user.id
        const updated = {
            firstName: data.firstName.toString(),
            lastName: data.lastName.toString(),
            about: data.about.toString() || ''
        }

        try {
            await this.userService.updateById(userId, updated)
            return JSON.stringify({ updated: true })
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('Could not update a user')
        }
    }

    @Get()
    @Header('Content-Type', 'application/json')
    async get(@Authorization() user: User): Promise<string> {
        if (!user) {
            throw new UnauthorizedException('You must authorize first to access this resource')
        }

        const id = user.id
        
        try {
            const data = await this.userService.get({ id })
            delete data.password
            delete data.role
            return JSON.stringify(data)
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('Could not get user data')
        }
    }
}
