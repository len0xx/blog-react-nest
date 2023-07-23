'use client'

import { API_ENDPOINT } from '@/config'
import { ValidationError, ValidationSchema, validateSchema } from '@/util'
import { Button, InlineAlert, TextInput } from 'evergreen-ui'
import { FormEvent, useRef, useState } from 'react'

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function RegForm() {
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false)
    const emailInput = useRef<HTMLInputElement>(null)
    const firstNameInput = useRef<HTMLInputElement>(null)
    const lastNameInput = useRef<HTMLInputElement>(null)
    const passwordInput = useRef<HTMLInputElement>(null)
    const passwordRepeatInput = useRef<HTMLInputElement>(null)

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

    const signUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const data = {
            email: emailInput.current!.value.toString(),
            firstName: firstNameInput.current!.value.toString(),
            lastName: lastNameInput.current!.value.toString(),
            password: passwordInput.current!.value.toString(),
            passwordRepeat: passwordRepeatInput.current!.value.toString()
        }

        const schema: ValidationSchema = {
            email: {
                required: true,
                matchRegex: emailRegex,
                errorText: 'Please enter a correct email address'
            },
            firstName: {
                required: true,
                minLen: 2,
                maxLen: 100
            },
            lastName: {
                required: true,
                minLen: 2,
                maxLen: 100
            },
            password: {
                required: true,
                minLen: 6,
                maxLen: 30
            },
            passwordRepeat: {
                required: true,
                minLen: 6,
                maxLen: 30,
                match: data.password,
                errorText: 'The passwords do not match'
            }
        }

        try {
            validateSchema(schema, data)
        }
        catch (e) {
            return e instanceof ValidationError ? errorState(e.message) : console.error(e)
        }

        const options: RequestInit = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user/create`, options)
        const response = await res.json()

        if (res.ok && response.created) {
            successState()
            setTimeout(() => window.location.href = '/login', 1000)
        }
        else {
            errorState(response.message || 'An error occurred. Please try again later')
        }
    }

    return (
        <div className="center-content">
            <form onSubmit={ signUp } className="auth-form">
                <h2>Sign Up</h2>
                <TextInput name="email" type="email" required placeholder="Email" width={ 300 } ref={ emailInput } />
                <TextInput name="firstName" type="text" required placeholder="First Name" width={ 300 } ref={ firstNameInput } />
                <TextInput name="lastName" type="text" required placeholder="Last Name" width={ 300 } ref={ lastNameInput } />
                <TextInput name="password" type="password" required placeholder="Password" width={ 300 } ref={ passwordInput } />
                <TextInput name="password-repeat" type="password" required placeholder="Repeat the password" width={ 300 } ref={ passwordRepeatInput } />
                <div className="buttons">
                    <Button type="submit" isLoading={ isLoading } appearance="primary">Sign Up</Button>
                    <a href="/login"><Button type="button" appearance="default">Log in</Button></a>
                </div>
                { success && <InlineAlert intent='success'>You have successfully signed up!</InlineAlert> }
                { error && <InlineAlert intent='danger'>{ errorText }</InlineAlert> }
            </form>
        </div>
    )
}
