import { ApiProperty } from "@nestjs/swagger"

export type UserRole = 'USER' | 'AUTHOR' | 'ADMIN'
export enum UserRoleEnum {
    USER = 'USER',
    AUTHOR = 'AUTHOR',
    ADMIN = 'ADMIN'
}

export default class UserDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    email: string
    @ApiProperty()
    firstName: string
    @ApiProperty()
    lastName: string
    @ApiProperty()
    fullName: string
    @ApiProperty()
    about?: string
    @ApiProperty()
    password: string
    @ApiProperty()
    role: UserRole
}

export class CreateUserDto {
    @ApiProperty()
    email: string
    @ApiProperty()
    firstName: string
    @ApiProperty()
    lastName: string
    @ApiProperty()
    password: string
    @ApiProperty()
    passwordRepeat: string
}

export class UpdateUserDto {
    @ApiProperty()
    email: string
    @ApiProperty()
    firstName: string
    @ApiProperty()
    lastName: string
    @ApiProperty()
    about?: string
}

export class UpdatePasswordDto {
    @ApiProperty()
    password: string
    @ApiProperty()
    newPassword: string
    @ApiProperty()
    newPasswordRep: string
}

export class AuthUserDto {
    @ApiProperty()
    email: string
    @ApiProperty()
    password: string
    @ApiProperty()
    token: string
}
