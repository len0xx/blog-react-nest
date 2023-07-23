'use client'

import { Button, TextInput, InlineAlert } from 'evergreen-ui'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRef, useState } from 'react'

export default function LoginForm() {
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false)
    const emailInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)
    const { data: session } = useSession()

    const auth = async () => {
        setIsLoading(true)
        const email = emailInput.current!.value.toString()
        const password = passwordInput.current!.value.toString()
        if (!email || !password) {
            setSuccess(false)
            setError(true)
            setErrorText('Please fill in all the fields')
            return
        }

        const options = {
            redirect: false,
            email: email,
            password: password
        }
        const response = await signIn('credentials', options)
        
        if (!response!.error) {
            setIsLoading(false)
            setSuccess(true)
            setError(false)
            setTimeout(() => window.location.href = '/', 1000)
        }
        else {
            setIsLoading(false)
            setError(true)
            setSuccess(false)
            setErrorText(response!.error || 'An error occurred. Please try again later')
        }
    }

    return (
        <div className="auth-form">
            <TextInput name="email" type="text" placeholder="Email" ref={ emailInput } />
            <TextInput name="password" type="password" placeholder="Password" ref={ passwordInput } />
            <div className="buttons">
                <Button isLoading={ isLoading } appearance="primary" onClick={ auth }>Log in</Button>
                { session && session.user && <Button appearance="default" onClick={ () => signOut() }>Log out</Button> }
            </div>
            { success && <InlineAlert intent='success'>You have successfully logged in!</InlineAlert> }
            { error && <InlineAlert intent='danger'>{ errorText }</InlineAlert> }
        </div>
    )
}
