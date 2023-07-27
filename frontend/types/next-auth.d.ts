import NextAuth from "next-auth"
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface User {
        id: number
        email: string
        about: string
        firstName: string
        lastName: string
        fullName: string
        backendToken: string
    }

    interface Session {
        user: User
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: number
        email: string
        about: string
        firstName: string
        lastName: string
        fullName: string
        backendToken: string
        sub: string
        iat: number
        exp: number
        jti: string
    }
}
