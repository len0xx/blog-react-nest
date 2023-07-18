'use client'

import { API_ENDPOINT } from '@/config'
import { Button, InlineAlert, TextInput } from 'evergreen-ui'
import { useRef, useState } from 'react'

export default function RegForm() {
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const emailInput = useRef<HTMLInputElement>(null)
    const nameInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)
    const passwordRepeatInput = useRef<HTMLInputElement>(null)

    const signUp = async () => {
        const data = {
            email: emailInput.current!.value.toString(),
            fullName: nameInput.current!.value.toString(),
            password: passwordInput.current!.value.toString(),
            passwordRepeat: passwordRepeatInput.current!.value.toString()
        }

        const options: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user/create`, options)
        const response = await res.json()

        if (res.ok && response.created) {
            setSuccess(true)
            setError(false)
            setTimeout(() => window.location.href = '/login', 1000)
        }
        else {
            setSuccess(false)
            setError(true)
            setErrorText(response.message || 'An error occurred. Please try again later')
        }
    }

    return (
        <div className="auth-form">
            <TextInput name="email" type="email" placeholder="Email" ref={ emailInput } />
            <TextInput name="fullName" type="text" placeholder="Full Name" ref={ nameInput } />
            <TextInput name="password" type="password" placeholder="Password" ref={ passwordInput } />
            <TextInput name="password-repeat" type="password" placeholder="Repeat the password" ref={ passwordRepeatInput } />
            <div className="buttons">
                <Button appearance="primary" onClick={ signUp }>Sign Up</Button>
                <a href="/login"><Button appearance="default">Log in</Button></a>
            </div>
            { success && <InlineAlert intent='success'>You have successfully signed up!</InlineAlert> }
            { error && <InlineAlert intent='danger'>{ errorText }</InlineAlert> }
        </div>
    )
}
