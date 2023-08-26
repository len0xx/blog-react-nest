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
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthGuard } from './auth.guard'
import { Authorization } from './auth.utilities'
import { Prisma, User } from '@prisma/client'
import { ExtendedUser } from './user.service'

const POSTS_AMOUNT = 20

@Controller('api/post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get()
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Read all the posts' })
    async getPosts(@Query('author') author: string, @Query('page') currentPage: string): Promise<string> {
        const page = currentPage && !isNaN(+currentPage) ? +currentPage : 1
        const offset = (page - 1) * POSTS_AMOUNT
        const where: Prisma.PostWhereInput = !isNaN(+author) ? { authorId: +author } : {}
        const posts = await this.postService.getAll({ where, orderBy: [ { id: 'desc' } ], skip: offset, take: POSTS_AMOUNT })
        const amount = await this.postService.count({ where })
        const pages = Math.ceil(amount / POSTS_AMOUNT)
        return JSON.stringify({ posts, pages, count: amount })
    }

    @Post()
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiCreatedResponse({ description: 'New post created successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiBadRequestResponse({ description: 'Missing required fields ("title", "content" & "published") or they are invalid' })
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
    @ApiOkResponse({ description: 'Read the post object' })
    @ApiNotFoundResponse({ description: 'No posts found with passed id' })
    @ApiBadRequestResponse({ description: 'Invalid post id' })
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
    @ApiOkResponse({ description: 'Post updated successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiNotFoundResponse({ description: 'No posts found with passed id' })
    @ApiBadRequestResponse({ description: 'Missing required fields ("title", "content" & "published") or they are invalid' })
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
    @ApiOkResponse({ description: 'New post created successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiNotFoundResponse({ description: 'No posts found with passed id' })
    async deletePost(@Param('id', ParseIntPipe) id: number): Promise<string> {
        if (!id || id < 0) throw new BadRequestException('Invalid post id')

        const post = await this.postService.get({ id })
        if (!post) throw new NotFoundException(`Post with id ${id} does not exist`)

        const result = await this.postService.delete({ id })
        if (result) return JSON.stringify({ ok: true })

        throw new BadRequestException('Could not delete a post')
    }

    @Get('favourites')
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Read the list of posts added to favourite for authorized user' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    async getFavourite(@Authorization() user: ExtendedUser): Promise<string> {
        try {
            const favourites = await this.postService.getFavourites(user.id)
            return JSON.stringify({ ok: true, favourites })
        } catch (e) {
            console.error(e)
            if (e instanceof NotFoundException) {
                throw e
            }
            else {
                throw new BadRequestException('Could not read a favourites list for authorized user')
            }
        }
    }

    @Post('favourite/:id')
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Post has been added to favourites for the specified user' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiBadRequestResponse({ description: 'Missing required param ("id") or it is invalid' })
    async toggleFavourites(@Param('id', ParseIntPipe) id: number, @Authorization() user: ExtendedUser): Promise<string> {
        try {
            const state = await this.postService.toggleFavourite(id, user.id)
            return JSON.stringify({ ok: true, state })
        } catch (e) {
            console.error(e)
            if (e instanceof NotFoundException) {
                throw e
            }
            else {
                throw new BadRequestException('Could not toggle a favourite state on a post')
            }
        }
    }
}
