import { Injectable } from '@nestjs/common'
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

    async updateById(id: number, data: PostDto): Promise<Post | null> {
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
}
