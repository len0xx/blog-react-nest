import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const PROTECTED_ROUTES = [ '/new', '/profile' ]
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })
    const authenticated = !!(token && token.id && token.email)

    if (!authenticated && PROTECTED_ROUTES.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}
