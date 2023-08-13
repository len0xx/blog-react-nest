"use client"

import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import styles from '@/app/styles/profile.module.css'
import { TextareaField, TextInput, Button, Label, InlineAlert } from "evergreen-ui"
import { API_ENDPOINT } from "@/config"
import { Post } from "@/util"
import Posts from "./Posts"

enum AllowedModes {
    Viewing,
    Editing
}

type LocalUser = Omit<User, 'backendToken'>

export default ({ page }: { page: number }) => {
    const { data: session } = useSession()
    const [ user, setUser ] = useState<LocalUser | null>(null)
    const [ posts, setPosts ] = useState<Post[]>([])
    const [ pages, setPages ] = useState<number>(1)
    const [ mode, setMode ] = useState<AllowedModes>(AllowedModes.Viewing)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ success, setSuccess ] = useState(false)
    const [ error, setError ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ firstName, setFirstName ] = useState('')
    const [ lastName, setLastName ] = useState('')
    const [ about, setAbout ] = useState('')

    const switchMode = () => {
        if (mode === AllowedModes.Viewing) {
            setMode(AllowedModes.Editing)
        }
        else {
            setMode(AllowedModes.Viewing)
        }
    }

    const fetchUser = async () => {
        const token = session!.user.backendToken
        const getOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': token }
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user`, getOptions)
        if (!res.ok) return null
        const response = await res.json()
        setUser(response)
    }

    const updateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const data = { firstName, lastName, about }

        const options: RequestInit = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': session!.user.backendToken! },
            body: JSON.stringify(data)
        }

        const res = await fetch(`${ API_ENDPOINT }/api/user/update`, options)
        const response = await res.json()

        setIsLoading(false)
        if (res.ok && response.updated) {
            setError(false)
            setSuccess(true)
            await fetchUser()
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
                headers: { 'Content-Type': 'application/json', 'Authorization': token }
            }
            
            fetch(`${ API_ENDPOINT }/api/user`, getOptions).then((res) => {
                let localUser: LocalUser | null = null
                res.json().then((response) => {
                    if (res.ok && response) {
                        localUser = response
                        setUser(response)
                    }
                    else {
                        localUser = session.user
                        setUser(session.user)
                    }
                    setFirstName(localUser!.firstName!)
                    setLastName(localUser!.lastName!)
                    setAbout(localUser!.about!)
            
                    fetch(`${ API_ENDPOINT }/api/post?author=${ localUser!.id }&page=${ page }`, getOptions).then((res) => {
                        res.json().then((response) => {
                            if (res.ok && response && response.posts) {
                                setPosts(response.posts)
                                setPages(response.pages)
                            }
                            else {
                                setPosts([])
                            }
                        })
                    })
                })
            })
        }
    }, [ session, page ])

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
                            <br />
                            <br />
                            { posts.length && 
                                <>
                                    <h3 className={ styles.profileHeader }>
                                        { user.fullName }'s posts ({ posts.length })
                                    </h3>
                                    <Posts posts={ posts } pages={ pages } />
                                </>
                            }
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
                </>
            }
        </>
    )
}
