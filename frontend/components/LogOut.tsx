'use client'

import { Button } from "evergreen-ui"
import { signOut } from "next-auth/react"

export default function LogOut() {
    return (
        <Button appearance="default" onClick={ () => signOut() }>Log out</Button>
    )
}
