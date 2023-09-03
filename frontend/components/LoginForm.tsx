'use client'

import { ValidationSchema } from '@/util'
import { Button, TextInput } from 'evergreen-ui'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRef, useState } from 'react'
import Form from './Form'

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function LoginForm() {
    const [ isLoading, setIsLoading ] = useState(false)
    const emailInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)
    const { data: session } = useSession()

    const schema: ValidationSchema = {
        email: {
            required: true,
            match: emailRegex,
            errorText: 'Please enter a correct email address'
        },
        password: {
            required: true,
            minLen: 6,
            maxLen: 30
        }
    }

    const auth = async () => {
        const email = emailInput.current!.value.toString()
        const password = passwordInput.current!.value.toString()

        const options = {
            redirect: false,
            email: email,
            password: password
        }
        const response = await signIn('credentials', options)
        
        if (!response!.error) {
            setTimeout(() => window.location.href = '/', 1000)
        }
        else {
            throw new Error(response!.error || 'An error occurred. Please try again later')
        }
    }

    return (
        <div className="center-content">
            <Form
                onSubmit={ auth }
                displayMsg
                successMessage="Successfully authorized"
                validation={ schema }
                onLoadingUpdate={ setIsLoading }
                className="auth-form"
            >
                <h2>Log In</h2>
                <TextInput name="email" type="text" placeholder="Email" required width={ 300 } ref={ emailInput } />
                <TextInput name="password" type="password" placeholder="Password" required width={ 300 } ref={ passwordInput } />
                <div className="buttons">
                    <Button type="submit" isLoading={ isLoading } appearance="primary">Log in</Button>
                    { session && session.user && <Button type="button" appearance="default" onClick={ () => signOut() }>Log out</Button> }
                </div>
            </Form>
        </div>
    )
}
