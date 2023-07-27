"use client"

import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { FormEvent, useEffect, useRef, useState } from "react"
import styles from '@/app/styles/profile.module.css'
import { TextareaField, TextInput, Button, Label, InlineAlert } from "evergreen-ui"
import { API_ENDPOINT } from "@/config"

enum AllowedModes {
    Viewing,
    Editing
}

export default () => {
    const { data: session } = useSession()
    const [ user, setUser ] = useState<User | null>(null)
    const [ mode, setMode ] = useState<AllowedModes>(AllowedModes.Viewing)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const firstNameInput = useRef<HTMLInputElement>(null)
    const lastNameInput = useRef<HTMLInputElement>(null)
    const aboutInput = useRef<HTMLTextAreaElement>(null)

    const switchMode = () => {
        if (mode === AllowedModes.Viewing) {
            setMode(AllowedModes.Editing)
        }
        else {
            setMode(AllowedModes.Viewing)
        }
    }

    const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const data = {
            firstName: firstNameInput.current!.value.toString(),
            lastName: lastNameInput.current!.value.toString(),
            about: aboutInput.current!.value.toString() 
        }

        const options: RequestInit = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': user!.backendToken! },
            body: JSON.stringify(data)
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user/update`, options)
        const response = await res.json()

        setIsLoading(false)
        if (res.ok && response.updated) {
            setError(false)
            setSuccess(true)
        }
        else {
            setSuccess(false)
            setError(true)
            setErrorText(response.message || 'An error occurred. Please try again later')
        }

    }

    useEffect(() => {
        if (session && session.user) {
            const token = session.user.backendToken
            const getOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': session.user.backendToken }
            }
            
            fetch(`${ API_ENDPOINT }/api/user`, getOptions).then((res) => {
                res.json().then((response) => {
                    if (res.ok && response) {
                        response.backendToken = token
                        setUser(response)
                    }
                    else setUser(session.user)
                })
            })
        }
    }, [ session ])

    return (
        <>
            { user &&
                <>
                    <h1 className={ styles.profileHeader }>{ mode === AllowedModes.Viewing ? user.fullName : 'Edit your profile' }</h1>
                    { mode === AllowedModes.Viewing ?
                        <>
                            { user.about && <p className={ styles.profileParagraph }>{ user.about }</p> }
                            <p className={ styles.profileParagraph }>ID: { user.id }</p>
                            <p className={ styles.profileParagraph }>Email: { user.email }</p>
                            <div className={ styles.buttons }>
                                <Button appearance="default" onClick={ switchMode }>Edit</Button>
                            </div>
                        </>
                        :
                        <form onSubmit={ updateProfile }>
                            <Label className="form-label" htmlFor="firstName" marginBottom={ 4 } display="block">
                                First Name
                            </Label>
                            <TextInput name="firstName" placeholder="First Name" width={ 400 } ref={ firstNameInput } />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="lastName" marginBottom={ 4 } display="block">
                                Last Name
                            </Label>
                            <TextInput name="lastName" placeholder="Last Name" width={ 400 } ref={ lastNameInput } />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="lastName" display="block">
                                About
                            </Label>
                            <TextareaField name="about" marginBottom={ 0 } maxWidth={ 400 } ref={ aboutInput } />
                            <br />
                            <div className={ styles.buttons }>
                                <Button type="submit" appearance="primary" className={ styles.actionButton } isLoading={ isLoading }>Save</Button>
                                <Button type="button" appearance="default" onClick={ switchMode }>Go back</Button>
                            </div>
                            <br />
                            { success && <InlineAlert intent='success'>Changes have been saved!</InlineAlert> }
                            { error && <InlineAlert intent='danger'>{ errorText }</InlineAlert> }
                        </form>
                    }
                    
                </>
            }
        </>
    )
}
