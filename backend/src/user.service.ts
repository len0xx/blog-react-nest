import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma.service"
import { User, Prisma } from '@prisma/client'
import type UserDto from "./user.dto"

export type CreateUser = Omit<UserDto, 'id' | 'role' | 'fullName'>

export interface ExtendedUser extends User {
    fullName: string
}

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    getFullName(user: User): string {
        return `${ user.firstName } ${ user.lastName }`
    }

    extend(user: User | null): ExtendedUser | null {
        return user ? {
            ...user,
            fullName: this.getFullName(user)
        } : null
    }

    async get(where: Prisma.UserWhereUniqueInput): Promise<ExtendedUser | null> {
        return this.extend(await this.prisma.user.findUnique({ where }))
    }

    async getByEmail(email: string): Promise<ExtendedUser | null> {
        return this.extend(await this.prisma.user.findFirst({ where: { email } }))
    }

    async getAll(args?: {
        select?: Prisma.UserSelect
        where?: Prisma.UserWhereInput
        orderBy?: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>
        cursor?: Prisma.UserWhereUniqueInput
        take?: number
        skip?: number
    }): Promise<ExtendedUser[]> {
        return (
            await this.prisma.user.findMany(args)
        ).map(
            user => this.extend(user)
        )
    }

    async create(data: CreateUser): Promise<ExtendedUser> {
        return this.extend(await this.prisma.user.create({ data }))
    }

    async update(
        where: Prisma.UserWhereUniqueInput,
        data: Partial<UserDto>,
    ): Promise<ExtendedUser> {
        return this.extend(await this.prisma.user.update({ where, data }))
    }

    async updateById(id: number, data: Partial<UserDto>): Promise<ExtendedUser | null> {
        return this.extend(await this.prisma.user.update({ where: { id }, data }))
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
