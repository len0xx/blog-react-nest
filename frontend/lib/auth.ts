import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { API_ENDPOINT_BACK } from "@/config"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com"
                },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const data = {
                    email: credentials!.email,
                    password: credentials!.password,
                    token: process.env.NEST_ACCESS_TOKEN
                }

                const options: RequestInit = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
                const response = await fetch(`${ API_ENDPOINT_BACK }/api/user/auth`, options)
                const res = await response.json()

                if (response.ok && res) {
                    return res
                }
                else {
                    throw new Error('Could not authorize') 
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = +user.id
                token.fullName = user.fullName
                token.backendToken = user.backendToken
            }
            return token
        },
        session({ session, token }) {
            if (session && token) {
                session.user.fullName = token.fullName
                session.user.id = token.id
                session.user.backendToken = token.backendToken
            }
            return session
        }
    }
}
