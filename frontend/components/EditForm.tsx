'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button, Dialog, toaster } from 'evergreen-ui'
import TipTap from './TipTap'
import Form, { FormRef } from './Form'
import { Post, callAPI } from '@/util'
import { TextInput } from 'evergreen-ui'
import { API_ENDPOINT } from '@/config'

interface Editor {
    getJSON: () => any
    getText: () => string
}

interface Props {
    post: Post
    token?: string
}

export default function EditForm({ post, token }: Props) {
    const [ isSlugLoading, setSlugLoading ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ disabled, setDisabled ] = useState(false)
    const [ mounted, setMounted ] = useState(false)
    const [ shown, setShown ] = useState(false)
    const [ slug, setSlug ] = useState<string | null>(post.slug || null)
    const [ customLink, setLink ] = useState('')
    const editor = useRef<Editor | null>(null)
    const formRef = useRef<FormRef>(null)
    const titleInput = useRef<HTMLInputElement>(null)
    const customLinkInput = useRef<HTMLInputElement>(null)
    const [ title, setTitle ] = useState(post.title)
    const [ content, setContent ] = useState(post.content)

    const inputUpdated = () => {
        const localTitle = titleInput.current!.value
        const localContentText = editor.current!.getText()
        const localContentJSON = editor.current!.getJSON()
        setTitle(localTitle)
        setContent(JSON.stringify(localContentJSON))
        setDisabled(!localContentText.length || !localTitle.length)
    }

    const details = {
        token,
        payload: {
            title,
            content,
            slug,
            published: true
        }
    }

    const trySubmit = () => {
        if (disabled) {
            toaster.danger(
                'You can not save this post',
                { description: 'Because either "Title" or "Content" field is empty' }
            )
        }
    }

    const saveLink = async () => {
        interface CheckResponse {
            ok: boolean
            available: boolean
        }

        setSlugLoading(true)
        if (customLink !== '') {
            try {
                const response = await callAPI<CheckResponse>(
                    `/api/post/check-slug/${ customLink }`,
                    { method: 'GET', token }
                )
                setSlugLoading(false)

                if (response.available) {
                    setSlug(customLink)
                    toaster.success('A custom link has successfully been saved')
                    setShown(false)
                }
                else {
                    toaster.danger(
                        'This custom link is unavailable',
                        { description: 'Because it\'s already taken' }
                    )
                }
            }
            catch (e) {
                console.error(e)
                setSlugLoading(false)
                toaster.danger('An error occurred while checking availability of this custom link')
            }
        }
    }

    const openDialog = () => {
        setShown(true)
        setTimeout(() => customLinkInput.current!.value = slug || '', 100)
    }

    useEffect(() => {
        if (!mounted) {
            titleInput.current!.focus()
            setMounted(true)
        }
    })

    return (
        <>
            <Dialog
                isShown={ shown }
                title="Set a custom link for this post"
                onCloseComplete={ () => setShown(false) }
                onConfirm={ saveLink }
                confirmLabel="Confirm"
                isConfirmLoading={ isSlugLoading }
                minHeightContent={ 0 }
            >
                <TextInput
                    placeholder="Custom link"
                    ref={ customLinkInput }
                    onInput={(e: FormEvent<HTMLInputElement>) => setLink((e.target as HTMLInputElement).value)}
                    width="100%"
                />
                <br />
                <br />
                <p style={{ color: 'black' }}>A complete link will look like: { API_ENDPOINT }/post/{ customLink }</p>
            </Dialog>
            <Form
                action={ `/api/post/${ post.id }` }
                method="PATCH"
                details={ details }
                displayMsg
                successMessage="A post has been successfully edited"
                errorMessage="An error occurred while editing the post. Please try again later"
                onLoadingUpdate={ setIsLoading }
                onSuccess={ () => { setTimeout(() => window.location.href = '/', 1000) } }
                ref={ formRef }
            >
                <input className='post-title' name="title" placeholder='Create a new post' ref={ titleInput } onChange={ inputUpdated } defaultValue={ post.title } />
                <TipTap initialContent={ post.content } onUpdate={ inputUpdated } ref={ editor } />
            </Form>
            <br />
            <div className="buttons">
                <span onClick={ trySubmit }>
                    <Button
                        type="button"
                        appearance="primary"
                        onClick={ () => formRef.current!.requestSubmit() }
                        isLoading={ isLoading }
                        disabled={ disabled }
                    >
                        Save
                    </Button>
                </span>
                <Button
                    type="button"
                    appearance="default"
                    onClick={ openDialog }
                >
                    { post.slug ? 'Change' : 'Set' } custom link
                </Button>
            </div>
        </>
    )
}
