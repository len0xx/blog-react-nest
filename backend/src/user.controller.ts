import { BadRequestException, Body, Controller, Get, Header, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UnauthorizedException } from "@nestjs/common"
import { ExtendedUser, UserService } from "./user.service"
import { compare, hash } from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Authorization } from "./auth.utilities"
import { User } from "@prisma/client"
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { AuthUserDto, CreateUserDto, UpdateUserDto } from "./user.dto"

const NEST_ACCESS_TOKEN = process.env.NEST_ACCESS_TOKEN as string
const NEST_AUTH_SECRET = process.env.AUTH_SECRET as string

@Controller('api/user')
export class UserController {
    constructor( private readonly userService: UserService ) {}

    @Post('create')
    @ApiTags('user')
    @Header('Content-Type', 'application/json')
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({ description: 'A new user has been created'})
    @ApiBadRequestResponse({ description: 'Missing required fields or invalid values (Nonmatching passwords or duplicated email)'})
    async create(@Body() data: CreateUserDto): Promise<string> {
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
    @ApiTags('user')
    @Header('Content-Type', 'application/json')
    @ApiOkResponse({ description: 'User\'s data'})
    @ApiBadRequestResponse({ description: 'Invalid email or password'})
    @ApiUnauthorizedResponse({ description: 'Unauthorized request'})
    async auth(@Body() data: AuthUserDto): Promise<string> {
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
    @ApiTags('user')
    @Header('Content-Type', 'application/json')
    @ApiOkResponse({ description: 'User has been updated'})
    @ApiBadRequestResponse({ description: 'Missing data ("firstName", "lastName" and "about")'})
    @ApiUnauthorizedResponse({ description: 'Unauthorized request'})
    async update(@Body() data: UpdateUserDto, @Authorization() user: User): Promise<string> {
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
    @ApiTags('user')
    @ApiOkResponse({ description: 'Get authorized user\'s data'})
    @ApiBadRequestResponse({ description: 'Could not fetch data for authorized user'})
    @ApiUnauthorizedResponse({ description: 'Unauthorized request'})
    async getAuthorized(@Authorization() user: ExtendedUser): Promise<string> {
        if (!user) {
            throw new UnauthorizedException('You must authorize first to access this resource')
        }

        const id = user.id
        
        try {
            const data = await this.userService.get({ id }, true)
            return JSON.stringify(data)
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('Could not get user data')
        }
    }

    @Get(':id')
    @Header('Content-Type', 'application/json')
    @ApiTags('user')
    @ApiOkResponse({ description: 'Get user data by id'})
    @ApiBadRequestResponse({ description: 'Could not fetch data for specified user'})
    async getById(@Param('id', ParseIntPipe) id: number): Promise<string> {
        try {
            const data = await this.userService.get({ id }, true)
            return JSON.stringify(data)
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('Could not get user data')
        }
    }
}
