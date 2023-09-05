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
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { AuthGuard } from './auth.guard'
import { Authorization } from './auth.utilities'
import { Prisma, User } from '@prisma/client'
import { ExtendedUser } from './user.service'
import { UserRoleEnum } from './user.dto'

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
        const where: Prisma.PostWhereInput = !isNaN(+author) ? { authorId: +author, published: true, archive: false } : { published: true, archive: false }
        const posts = await this.postService.getAll({ where, orderBy: [ { id: 'desc' } ], skip: offset, take: POSTS_AMOUNT })
        const amount = await this.postService.count({ where })
        const pages = Math.ceil(amount / POSTS_AMOUNT)
        return JSON.stringify({ posts, pages, count: amount })
    }

    @Post()
    @UseGuards(new AuthGuard([ UserRoleEnum.ADMIN ]))
    @HttpCode(HttpStatus.CREATED)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiCreatedResponse({ description: 'New post created successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiForbiddenResponse({ description: 'Authorized user doesn\'t have permission to this resource' })
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
            if (!post || !post.published || post.archive) throw new NotFoundException(`Post with id ${ id } not found`)
            return JSON.stringify(post)
        }

        throw new BadRequestException('Invalid post id')
    }

    @Get('slug/:slug')
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Read the post object' })
    @ApiNotFoundResponse({ description: 'No posts found with passed slug' })
    @ApiBadRequestResponse({ description: 'Invalid slug' })
    async getPostBySlug(@Param('slug') slug: string): Promise<string> {
        if (slug) {
            const post = await this.postService.get({ slug })
            if (!post || !post.published || post.archive) throw new NotFoundException(`Post with slug ${ slug } not found`)
            return JSON.stringify(post)
        }

        throw new BadRequestException('Invalid slug')
    }

    @Patch(':id')
    @UseGuards(new AuthGuard([ UserRoleEnum.ADMIN ]))
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Post updated successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiForbiddenResponse({ description: 'Authorized user doesn\'t have permission to this resource' })
    @ApiNotFoundResponse({ description: 'No posts found with passed id' })
    @ApiBadRequestResponse({ description: 'Missing required fields ("title", "content" & "published") or they are invalid' })
    async updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: PostDto,
    ): Promise<string> {
        if (!id || id < 0) throw new BadRequestException('Invalid post id')
        if (!data.title || !data.content) {
            throw new BadRequestException(
                'Fields "title" & "content" are required'
            )
        }
        if (data.slug && !/^[a-zA-Z0-9\-_]*$/.test(data.slug)) {
            throw new BadRequestException('Custom link should only contain alpha-numeric characters or symbols "-" and "_"')
        }

        const post = await this.postService.get({ id })
        if (!post || !post.published || post.archive) throw new NotFoundException(`Post with id ${id} does not exist`)

        try {
            const post = await this.postService.updateById(id, data)
            return JSON.stringify(post)
        } catch (e) {
            console.error(e)
            throw new BadRequestException('Could not update a post')
        }
    }

    @Delete(':id')
    @UseGuards(new AuthGuard([ UserRoleEnum.ADMIN ]))
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'New post created successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiForbiddenResponse({ description: 'Authorized user doesn\'t have permission to this resource' })
    @ApiNotFoundResponse({ description: 'No posts found with passed id' })
    async deletePost(@Param('id', ParseIntPipe) id: number): Promise<string> {
        if (!id || id < 0) throw new BadRequestException('Invalid post id')

        const post = await this.postService.get({ id })
        if (!post || !post.published || post.archive) throw new NotFoundException(`Post with id ${id} does not exist`)

        const result = await this.postService.updateById(id, { archive: true })
        if (result) return JSON.stringify({ ok: true })

        throw new BadRequestException('Could not delete a post')
    }

    @Get('check-slug/:slug')
    @UseGuards(new AuthGuard([ UserRoleEnum.ADMIN ]))
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Check if a specified slug is available' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiForbiddenResponse({ description: 'Authorized user doesn\'t have permission to this resource' })
    @ApiBadRequestResponse({ description: 'Could not check this slug' })
    async checkSlug(@Param('slug') slug: string): Promise<string> {
        try {
            const post = await this.postService.get({ slug })
            return JSON.stringify({ ok: true, available: !post })
        } catch (e) {
            console.error(e)
            throw new BadRequestException('Could not check this slug')
        }
    }

    @Get('favourites')
    @UseGuards(new AuthGuard())
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
    @UseGuards(new AuthGuard())
    @HttpCode(HttpStatus.OK)
    @Header('Content-Type', 'application/json')
    @ApiTags('blog')
    @ApiOkResponse({ description: 'Post has been added to favourites for the specified user' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
    @ApiBadRequestResponse({ description: 'Missing required param ("id") or it is invalid' })
    async toggleFavourites(@Param('id', ParseIntPipe) id: number, @Authorization() user: ExtendedUser): Promise<string> {
        try {
            console.log(id, user.id)
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
