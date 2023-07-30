import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { PostService } from './post.service'
import PostDto, { CreatePostDto } from './post.dto'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from './auth.guard'
import { Authorization } from './auth.utilities'
import { Prisma, User } from '@prisma/client'

@Controller('api/post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Read all the posts'})
    async getPosts(@Query('author') author: string): Promise<string> {
        const where: Prisma.PostWhereInput = !isNaN(+author) ? { authorId: +author } : {}
        const posts = await this.postService.getAll({ where, orderBy: [ { id: 'desc' } ] })
        return JSON.stringify(posts)
    }

    @Post()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiCreatedResponse({ description: 'New post created successfully'})
    @ApiBadRequestResponse({ description: 'Missing required fields ("title", "content" & "published") or they are invalid'})
    async createPost(@Body() data: CreatePostDto, @Authorization() user: Omit<User, 'password'>): Promise<string> {
        if (
            !data.title ||
            !data.content ||
            !(
                typeof data.published === 'boolean' ||
                (typeof data.published === 'string' && data.published)
            )
        ) {
            throw new BadRequestException(
                'Fields "title", "content" & "published" are required'
            )
        }

        if (typeof data.published !== 'boolean') {
            data.published =
                typeof data.published === 'string'
                    ? data.published === 'true'
                    : !!data.published
        }

        try {
            const postData: PostDto = { ...data, authorId: user.id }
            const post = await this.postService.create(postData)
            return JSON.stringify(post)
        } catch (e) {
            console.error(e)
            throw new BadRequestException('Could not create a post')
        }
    }

    @Get(':id')
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Read the post object'})
    @ApiNotFoundResponse({ description: 'No posts found with passed id'})
    @ApiBadRequestResponse({ description: 'Invalid post id'})
    async getPost(@Param('id', ParseIntPipe) id: number): Promise<string> {
        if (id) {
            const post = await this.postService.get({ id })
            if (!post) throw new NotFoundException(`Post with id ${id} not found`)
            return JSON.stringify(post)
        }

        throw new BadRequestException('Invalid post id')
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Post updated successfully'})
    @ApiNotFoundResponse({ description: 'No posts found with passed id'})
    @ApiBadRequestResponse({ description: 'Missing required fields ("title", "content" & "published") or they are invalid'})
    async updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: PostDto,
    ): Promise<string> {
        if (!id || id < 0) throw new BadRequestException('Invalid post id')

        const post = await this.postService.get({ id })
        if (!post) throw new NotFoundException(`Post with id ${id} does not exist`)

        try {
            const post = await this.postService.updateById(id, data)
            return JSON.stringify(post)
        } catch (e) {
            console.error(e)
            throw new BadRequestException('Could not update a post')
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'New post created successfully'})
    @ApiNotFoundResponse({ description: 'No posts found with passed id'})
    async deletePost(@Param('id', ParseIntPipe) id: number): Promise<string> {
        if (!id || id < 0) throw new BadRequestException('Invalid post id')

        const post = await this.postService.get({ id })
        if (!post) throw new NotFoundException(`Post with id ${id} does not exist`)

        const result = await this.postService.delete({ id })
        if (result) return JSON.stringify({ ok: true })

        throw new BadRequestException('Could not delete a post')
    }
}
