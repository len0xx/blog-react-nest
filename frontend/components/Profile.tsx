"use client"

import { useSession } from "next-auth/react"

export const User = () => {
    const { data: session } = useSession()

    return (
        <>
            <h1>{ session && session.user ? session.user.fullName : 'Loading' }</h1>
            <pre>{JSON.stringify(session)}</pre>
        </>
    )
}
