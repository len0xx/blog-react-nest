import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Post, Prisma } from '@prisma/client'
import type PostDto from './post.dto'

@Injectable()
export class PostService {
    constructor(private prisma: PrismaService) {}

    async get(where: Prisma.PostWhereUniqueInput): Promise<Post | null> {
        return await this.prisma.post.findUnique({ where })
    }

    async getAll(args?: {
        select?: Prisma.PostSelect
        where?: Prisma.PostWhereInput
        orderBy?: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput>
        cursor?: Prisma.PostWhereUniqueInput
        take?: number
        skip?: number
    }): Promise<Post[]> {
        return await this.prisma.post.findMany(args)
    }

    async count(args?: {
        where?: Prisma.PostWhereInput
    }): Promise<number> {
        return await this.prisma.post.count(args)
    }

    async create(data: PostDto): Promise<Post> {
        return await this.prisma.post.create({ data })
    }

    async update(
        where: Prisma.PostWhereUniqueInput,
        data: PostDto,
    ): Promise<Post> {
        return await this.prisma.post.update({ where, data })
    }

    async updateById(id: number, data: Partial<PostDto>): Promise<Post | null> {
        return await this.prisma.post.update({ where: { id }, data })
    }

    async delete(where: Prisma.PostWhereInput): Promise<boolean> {
        try {
            await this.prisma.post.deleteMany({ where })
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async toggleFavourite(id: number, userId: number): Promise<boolean> {
        const post = await this.get({ id })
        const user = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!post || !post.published || post.archive || !user) throw new NotFoundException(`Either post or user with specified id is not found. [ postId: ${ id }, userId: ${ userId } ]`)

        try {
            const data = { userId: user.id, postId: post.id }
            const record = await this.prisma.favourites.findUnique({ where: { postId_userId: data } })
            if (!record) {
                await this.prisma.favourites.create({ data })
                return true
            }
            else {
                await this.prisma.favourites.delete({ where: { postId_userId: data } })
                return false
            }
        }
        catch (e) {
            console.error(e)
            throw new Error(`An error occurred while toggling the favourite state. [ postId: ${ id }, userId: ${ userId } ]`)
        }
    }

    async getFavourites(id: number): Promise<number[]> {
        const user = await this.prisma.user.findUnique({ where: { id } })
        if (!user) throw new NotFoundException(`A user with specified id is not found. [ userId: ${ id } ]`)

        try {
            const data = { userId: user.id }
            const records = await this.prisma.favourites.findMany({ where: data })
            return records.map((record) => record.postId)
        }
        catch (e) {
            console.error(e)
            throw new Error(`An error occurred while reading the favourite posts. [ userId: ${ id } ]`)
        }
    }
}
