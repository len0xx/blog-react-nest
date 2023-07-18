import { BadRequestException, Body, Controller, Header, Post } from "@nestjs/common"
import { UserService } from "./user.service"
import UserDto from "./user.dto"
import { compare, hash } from 'bcrypt'

@Controller('api/user')
export class UserController {
    constructor( private readonly userService: UserService ) {}

    @Post('create')
    @Header('Content-Type', 'application/json')
    async createUser(@Body() data: Omit<UserDto, 'id'> & { passwordRepeat: string }): Promise<string> {
        if (!data.email || !data.fullName || !data.password || !data.passwordRepeat) {
            throw new BadRequestException('Fields "email", "fullName" and "password" are required')
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
                fullName: data.fullName
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
    async authUser(@Body() data: { email?: string, password?: string }): Promise<string> {
        if (!data.email || !data.password) {
            throw new BadRequestException('Invalid "email" or "password"')
        }

        try {
            const user = await this.userService.getByEmail(data.email)
            if (!user) throw new BadRequestException('Invalid "email" or "password"')

            const match = await compare(data.password, user.password)
            if (!match) throw new BadRequestException('Invalid "email" or "password"')

            return JSON.stringify({
                id: user.id,
                email: user.email,
                fullName: user.fullName
            })
        }
        catch (e) {
            console.error(e)
            throw new BadRequestException('An internal error occurred during the authorization process. Please try again later')
        }
    }
}
