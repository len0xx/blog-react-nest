"use client"

import styles from '@/app/styles/profile.module.css'
import { Post, User, callAPI } from "@/util"
import Posts from "./Posts"
import { ChangeEvent, FormEvent, useState } from 'react'
import { Button, InlineAlert, Label, TextInput, TextareaField } from 'evergreen-ui'
import { API_ENDPOINT } from '@/config'

interface Props {
    posts: Post[]
    pages: number
    count: number
    token?: string
    editable?: boolean
    user: User
}

enum AllowedModes {
    Viewing,
    Editing
}

export default ({ user, posts, pages, count, editable = false, token }: Props) => {
    const [ mode, setMode ] = useState<AllowedModes>(AllowedModes.Viewing)
    const [ localUser, setUser ] = useState<User>(user)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ firstName, setFirstName ] = useState(user.firstName)
    const [ lastName, setLastName ] = useState(user.lastName)
    const [ about, setAbout ] = useState(user.about)
    const [ localCount, setCount ] = useState(count)

    const switchMode = () => setMode(mode === AllowedModes.Viewing ? AllowedModes.Editing : AllowedModes.Viewing)

    const fetchUser = async () => {
        const getOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': token! }
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user`, getOptions)
        if (!res.ok) return null
        const response = await res.json()
        setUser(response)
    }

    const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const payload = { firstName, lastName, about }

        try {
            await callAPI('/api/user/update', { method: 'PATCH', payload, token })
            setIsLoading(false)
            setError(false)
            setSuccess(true)
            await fetchUser()
        }
        catch (e) {
            setIsLoading(false)
            setSuccess(false)
            setError(true)
            setErrorText((e as Error).message || 'An error occurred. Please try again later')
        }
    }

    const postsUpdated = (newPosts: Post[]) => {
        if (newPosts.length < posts.length) {
            setCount(localCount - 1)
        }
    }

    return (
        <>
            { user &&
                <>
                    <h1 className={ styles.profileHeader }>{ mode === AllowedModes.Viewing ? localUser.fullName : 'Edit your profile' }</h1>
                    { mode === AllowedModes.Viewing ?
                        <>
                            { localUser.about && <p className={ styles.profileParagraph }>{ localUser.about }</p> }
                            <p className={ styles.profileParagraph }>ID: { localUser.id }</p>
                            <p className={ styles.profileParagraph }>Email: { localUser.email }</p>
                            { editable && <div className={ styles.buttons }>
                                <Button appearance="default" onClick={ switchMode }>Edit</Button>
                            </div> }
                        </>
                        :
                        <form onSubmit={ updateProfile }>
                            <Label className="form-label" htmlFor="firstName" marginBottom={ 4 } display="block">
                                First Name
                            </Label>
                            <TextInput
                                name="firstName"
                                placeholder="First Name"
                                width={ 400 }
                                defaultValue={ firstName }
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target!.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="lastName" marginBottom={ 4 } display="block">
                                Last Name
                            </Label>
                            <TextInput 
                                name="lastName"
                                placeholder="Last Name"
                                width={ 400 }
                                defaultValue={ lastName } 
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target!.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="lastName" display="block">
                                About
                            </Label>
                            <TextareaField
                                name="about"
                                marginBottom={ 0 }
                                maxWidth={ 400 }
                                defaultValue={ about }
                                onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target!.value) }
                            />
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
                    <br />
                    <br />
                    { posts.length ?
                        <>
                            <h3 className={ styles.profileHeader }>
                                { user.fullName }'s posts ({ localCount })
                            </h3>
                            <Posts
                                posts={ posts }
                                pages={ pages }
                                editable={ editable }
                                token={ token }
                                onUpdate={ postsUpdated }
                            />
                        </>
                        :
                        <></>
                    }
                </>
            }
        </>
    )
}