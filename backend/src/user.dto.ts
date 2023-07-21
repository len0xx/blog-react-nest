import { ApiProperty } from "@nestjs/swagger"

export type UserRole = 'USER' | 'ADMIN'
export enum UserRoleEnum {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export default class UserDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    email: string
    @ApiProperty()
    fullName: string
    @ApiProperty()
    password: string
    @ApiProperty()
    role: UserRole
}
