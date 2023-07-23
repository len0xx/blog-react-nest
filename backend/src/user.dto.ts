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
    password: string
    @ApiProperty()
    role: UserRole
}
