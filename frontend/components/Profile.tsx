"use client"

import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default () => {
    const { data: session } = useSession()
    const [ user, setUser ] = useState<User | null>(null)
    console.log(user)

    useEffect(() => {
        if (session && session.user) setUser(session.user)
    }, [ session ])

    return (
        <>
            { user &&
                <>
                    <h1>{ user.fullName }</h1>
                    <p>ID: { user.id }</p>
                    <p>Email: { user.email }</p>
                </>
            }
        </>
    )
}
