import { Injectable } from "@nestjs/common"
import { PrismaService } from "./prisma.service"
import { User, Prisma } from '@prisma/client'
import type UserDto from "./user.dto"
import { CreateUserDto } from "./user.dto"

export interface AdditionalUserFields {
    fullName: string
}

// Make properties of U optional on type T while other properties remain required
export type PartialPick<T, U extends keyof T> = Omit<T, U> & Partial<Pick<T, U>>

export type ExtendedUser = PartialPick<User, 'role' | 'password'> & AdditionalUserFields

export type FullUser = User & AdditionalUserFields

export type SanitizedUser = Omit<User, 'password' | 'role'>

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    getFullName(user: User): string {
        return `${ user.firstName } ${ user.lastName }`
    }

    sanitize(user: User | null): PartialPick<User, 'role' | 'password'> | null {
        if (!user) return null

        delete user.password
        delete user.role

        return user
    }

    extend(user: User | null, sanitize = false): ExtendedUser | null {
        if (!user) return null

        return { ...(sanitize ? this.sanitize(user) : user), fullName: this.getFullName(user) }
    }

    async get(where: Prisma.UserWhereUniqueInput, sanitize = false): Promise<ExtendedUser | null> {
        return this.extend(await this.prisma.user.findUnique({ where }), sanitize)
    }

    async getByEmail(email: string, sanitize = false): Promise<ExtendedUser | null> {
        return this.extend(await this.prisma.user.findFirst({ where: { email } }), sanitize)
    }

    async getAll(args?: {
        select?: Prisma.UserSelect
        where?: Prisma.UserWhereInput
        orderBy?: Prisma.Enumerable<Prisma.UserOrderByWithRelationInput>
        cursor?: Prisma.UserWhereUniqueInput
        take?: number
        skip?: number
    }, sanitize = false): Promise<ExtendedUser[]> {
        return (
            await this.prisma.user.findMany(args)
        ).map(
            user => this.extend(user, sanitize)
        )
    }

    async create(data: Omit<CreateUserDto, 'passwordRepeat'>): Promise<ExtendedUser> {
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
