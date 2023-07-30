import { ApiProperty } from "@nestjs/swagger"

export default class PostDto {
    @ApiProperty()
    title: string
    @ApiProperty()
    content: string
    @ApiProperty()
    published: boolean
    @ApiProperty()
    authorId: number
}

export class CreatePostDto {
    @ApiProperty()
    title: string
    @ApiProperty()
    content: string
    @ApiProperty()
    published: boolean
}
