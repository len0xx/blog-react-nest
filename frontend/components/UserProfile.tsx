"use client"

import styles from '@/app/styles/profile.module.css'
import { Post, User, ValidationSchema, callAPI } from "@/util"
import Posts from "./Posts"
import { ChangeEvent, useState } from 'react'
import { Button, Label, TextInput, TextareaField } from 'evergreen-ui'
import Form from './Form'

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
    Editing,
    ChangePass
}

export default ({ user, posts, pages, count, editable = false, token }: Props) => {
    const [ mode, setMode ] = useState<AllowedModes>(AllowedModes.Viewing)
    const [ localUser, setUser ] = useState<User>(user)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isLoadingPass, setIsLoadingPass ] = useState(false)
    const [ firstName, setFirstName ] = useState(user.firstName)
    const [ lastName, setLastName ] = useState(user.lastName)
    const [ about, setAbout ] = useState(user.about)
    const [ password, setPassword ] = useState('')
    const [ newPassword, setNewPassword ] = useState('')
    const [ newPasswordRep, setNewPasswordRep ] = useState('')
    const [ localCount, setCount ] = useState(count)

    const pageHeading = (mode: AllowedModes, fullName: string) => {
        if (mode === AllowedModes.Viewing) return fullName
        else if (mode === AllowedModes.Editing) return 'Edit your profile'
        else return 'Change password'
    }

    const dataSchema: ValidationSchema = {
        firstName: {
            required: true,
            minLen: 2,
            maxLen: 100
        },
        lastName: {
            required: true,
            minLen: 2,
            maxLen: 100
        }
    }

    const passwordSchema: ValidationSchema = {
        password: {
            required: true,
            minLen: 6,
            maxLen: 30,
            alphaNum: true
        },
        newPassword: {
            required: true,
            minLen: 6,
            maxLen: 30,
            alphaNum: true
        },
        newPasswordRep: {
            required: true,
            match: newPassword
        }
    }

    const fetchUser = async () => {
        try {
            const response = await callAPI<User>(`/api/user`, { method: 'GET', token })
            setUser(response)
        }
        finally {}
    }

    const details = {
        token,
        payload: {
            firstName,
            lastName,
            about
        }
    }

    const detailsPass = {
        token,
        payload: {
            password,
            newPassword,
            newPasswordRep
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
                    <h1 className={ styles.profileHeader }>{ pageHeading(mode, localUser.fullName) }</h1>
                    { mode === AllowedModes.Viewing ?
                        <>
                            { localUser.about && <p className={ styles.profileParagraph }>{ localUser.about }</p> }
                            <p className={ styles.profileParagraph }>ID: { localUser.id }</p>
                            <p className={ styles.profileParagraph }>Email: { localUser.email }</p>
                            { editable && <div className={ styles.buttons }>
                                <Button appearance="default" onClick={ () => setMode(AllowedModes.Editing) }>Edit</Button>
                            </div> }
                        </>
                        :
                        <></>
                    }
                    { mode === AllowedModes.Editing ?
                        <Form
                            action="/api/user"
                            method="PATCH"
                            details={ details }
                            displayMsg
                            validation={ dataSchema }
                            onLoadingUpdate={ setIsLoading }
                            successMessage="Changes have been saved"
                            errorMessage="Unexpected error"
                            onSuccess={ fetchUser }
                        >
                            <Label className="form-label" htmlFor="firstName" marginBottom={ 4 } display="block">
                                First Name
                            </Label>
                            <TextInput
                                id="firstName"
                                name="firstName"
                                placeholder="First Name"
                                width={ 400 }
                                defaultValue={ firstName }
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="lastName" marginBottom={ 4 } display="block">
                                Last Name
                            </Label>
                            <TextInput 
                                id="lastName"
                                name="lastName"
                                placeholder="Last Name"
                                width={ 400 }
                                defaultValue={ lastName } 
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="about" display="block">
                                About
                            </Label>
                            <TextareaField
                                id="about"
                                name="about"
                                marginBottom={ 0 }
                                maxWidth={ 400 }
                                defaultValue={ about }
                                onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => setAbout(e.target.value) }
                            />
                            <br />
                            <div className={ styles.buttons }>
                                <Button type="submit" appearance="primary" className={ styles.actionButton } isLoading={ isLoading }>Save</Button>
                                <Button type="button" appearance="default" className={ styles.actionButton } onClick={ () => setMode(AllowedModes.ChangePass) }>Change password</Button>
                                <Button type="button" appearance="default" onClick={ () => setMode(AllowedModes.Viewing) }>Go back</Button>
                            </div>
                            <br />
                        </Form>
                        :
                        <></>
                    }
                    { mode === AllowedModes.ChangePass ?
                        <Form
                            action="/api/user/password"
                            method="PATCH"
                            details={ detailsPass }
                            displayMsg
                            validation={ passwordSchema }
                            onLoadingUpdate={ setIsLoadingPass }
                            successMessage="The password has been changed"
                            errorMessage="Unexpected error"
                        >
                            <Label className="form-label" htmlFor="password" marginBottom={ 4 } display="block">
                                Current password
                            </Label>
                            <TextInput
                                id="password"
                                name="password"
                                type="password"
                                width={ 400 }
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="newPassword" marginBottom={ 4 } display="block">
                               New password 
                            </Label>
                            <TextInput 
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                width={ 400 }
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value) }
                            />
                            <br />
                            <br />
                            <Label className="form-label" htmlFor="newPasswordRep" marginBottom={ 4 } display="block">
                                Repeat the new password
                            </Label>
                            <TextInput
                                id="newPasswordRep"
                                name="newPasswordRep"
                                type="password"
                                width={ 400 }
                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setNewPasswordRep(e.target.value) }
                            />
                            <br />
                            <br />
                            <div className={ styles.buttons }>
                                <Button type="submit" appearance="primary" className={ styles.actionButton } isLoading={ isLoadingPass }>Save</Button>
                                <Button type="button" appearance="default" className={ styles.actionButton } onClick={ () => setMode(AllowedModes.Editing) }>Edit profile info</Button>
                                <Button type="button" appearance="default" onClick={ () => setMode(AllowedModes.Viewing) }>Go back</Button>
                            </div>
                            <br />
                        </Form>
                        :
                        <></>
                    }
                    <br />
                    <br />
                    <br />
                    { posts.length ?
                        <>
                            <h2 className={ styles.profileHeader }>
                                { user.fullName }'s posts ({ localCount })
                            </h2>
                            <Posts
                                posts={ posts }
                                pages={ pages }
                                editable={ editable }
                                favouritable={ editable }
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
