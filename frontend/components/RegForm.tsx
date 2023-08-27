'use client'

import { ValidationSchema } from '@/util'
import { Button, TextInput } from 'evergreen-ui'
import { ChangeEvent, useState } from 'react'
import Form, { FormDetails } from './Form'

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export default function RegForm() {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ email, setEmail ] = useState('')
    const [ firstName, setFirstName ] = useState('')
    const [ lastName, setLastName ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ passwordRep, setPasswordRep ] = useState('')

    const details: FormDetails = {
        payload: {
            email,
            firstName,
            lastName,
            password,
            passwordRepeat: passwordRep
        }
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
            maxLen: 30,
            alphaNum: true
        },
        passwordRepeat: {
            required: true,
            match: password,
            errorText: 'The passwords do not match'
        }
    }

    return (
        <div className="center-content">
            <Form
                action="/api/user/create"
                method="POST"
                displayMsg
                details={ details }
                validation={ schema }
                successMessage="You have successfully signed up!"
                errorMessage="Something went wrong. Please try again later"
                onLoadingUpdate={ setIsLoading }
                onSuccess={ () => { setTimeout(() => window.location.href = '/login', 1000) } }
                className="auth-form"
            >
                <h2>Sign Up</h2>
                <TextInput name="email" type="email" required placeholder="Email" width={ 300 } onChange={ (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value) } />
                <TextInput name="firstName" type="text" required placeholder="First Name" width={ 300 } onChange={ (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value) }  />
                <TextInput name="lastName" type="text" required placeholder="Last Name" width={ 300 } onChange={ (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value) }  />
                <TextInput name="password" type="password" required placeholder="Password" width={ 300 } onChange={ (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value) }  />
                <TextInput name="password-repeat" type="password" required placeholder="Repeat the password" width={ 300 } onChange={ (e: ChangeEvent<HTMLInputElement>) => setPasswordRep(e.target.value) } />
                <div className="buttons">
                    <Button type="submit" isLoading={ isLoading } appearance="primary">Sign Up</Button>
                    <a href="/login"><Button type="button" appearance="default">Log in</Button></a>
                </div>
            </Form>
        </div>
    )
}
