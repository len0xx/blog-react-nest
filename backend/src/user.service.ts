import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma.service"
import { User, Prisma } from '@prisma/client'
import type UserDto from "./user.dto"

export type CreateUser = Omit<UserDto, 'id' | 'role'>

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async get(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await this.prisma.user.findUnique({ where })
    }

    async getByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findFirst({ where: { email } })
    }

    async getAll(args?: {
        select?: Prisma.UserSelect;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>;
        cursor?: Prisma.UserWhereUniqueInput;
        take?: number;
        skip?: number;
    }): Promise<User[]> {
        return await this.prisma.user.findMany(args)
    }

    async create(data: CreateUser): Promise<User> {
        return await this.prisma.user.create({ data })
    }

    async update(
        where: Prisma.UserWhereUniqueInput,
        data: UserDto,
    ): Promise<User> {
        return await this.prisma.user.update({ where, data })
    }

    async updateById(id: number, data: UserDto): Promise<User | null> {
        return await this.prisma.user.update({ where: { id }, data })
    }

    async delete(where: Prisma.UserWhereInput): Promise<boolean> {
        try {
            await this.prisma.user.deleteMany({ where })
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }
}
