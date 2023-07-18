import { ApiProperty } from "@nestjs/swagger"

export default class UserDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    email: string
    @ApiProperty()
    fullName: string
    @ApiProperty()
    password: string
}
