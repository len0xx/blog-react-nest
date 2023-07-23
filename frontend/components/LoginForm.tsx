'use client'

import { ValidationError, ValidationSchema, validateSchema } from '@/util'
import { Button, TextInput, InlineAlert } from 'evergreen-ui'
import { signIn, signOut, useSession } from 'next-auth/react'
import { FormEvent, useRef, useState } from 'react'

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function LoginForm() {
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false)
    const emailInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)
    const { data: session } = useSession()

    const successState = () => {
        setIsLoading(false)
        setError(false)
        setErrorText('')
        setSuccess(true)
    }

    const errorState = (message: string) => {
        setIsLoading(false)
        setSuccess(false)
        setError(true)
        setErrorText(message)
    }

    const auth = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const email = emailInput.current!.value.toString()
        const password = passwordInput.current!.value.toString()

        const schema: ValidationSchema = {
            email: {
                required: true,
                matchRegex: emailRegex,
                errorText: 'Please enter a correct email address'
            },
            password: {
                required: true,
                minLen: 6,
                maxLen: 30
            }
        }

        try {
            validateSchema(schema, { email, password })
        }
        catch (e) {
            return e instanceof ValidationError ? errorState(e.message) : console.error(e)
        }

        const options = {
            redirect: false,
            email: email,
            password: password
        }
        const response = await signIn('credentials', options)
        
        if (!response!.error) {
            successState()
            setTimeout(() => window.location.href = '/', 1000)
        }
        else {
            errorState(response!.error || 'An error occurred. Please try again later')
        }
    }

    return (
        <div className="center-content">
            <form onSubmit={ auth } className="auth-form">
                <h2>Log In</h2>
                <TextInput name="email" type="text" placeholder="Email" required width={ 300 } ref={ emailInput } />
                <TextInput name="password" type="password" placeholder="Password" required width={ 300 } ref={ passwordInput } />
                <div className="buttons">
                    <Button type="submit" isLoading={ isLoading } appearance="primary">Log in</Button>
                    { session && session.user && <Button type="button" appearance="default" onClick={ () => signOut() }>Log out</Button> }
                </div>
                { success && <InlineAlert intent='success'>You have successfully logged in!</InlineAlert> }
                { error && <InlineAlert intent='danger'>{ errorText }</InlineAlert> }
            </form>
        </div>
    )
}
