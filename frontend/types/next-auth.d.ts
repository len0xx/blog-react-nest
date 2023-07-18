import NextAuth from "next-auth"
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface User {
        id: number
        email: string
        fullName: string
    }

    interface Session {
        user: User
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        email: string
        id: number
        sub: string
        fullName: string
        iat: number
        exp: number
        jti: string
    }
}
