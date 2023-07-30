'use client'

import { FormEvent, useRef, useState } from 'react'
import { TextInput, Button, Label, InlineAlert } from 'evergreen-ui'
import { API_ENDPOINT } from '@/config'
import TipTap from './TipTap'
import { Session } from 'next-auth'

interface Editor {
    getJSON: () => string 
}

export default function NewForm({ session }: { session: Session }) {
    const [ success, setSuccess ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ error, setError ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const editor = useRef<Editor | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const titleInput = useRef<HTMLInputElement>(null)

    const createPost = () => formRef.current?.requestSubmit()

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const content = editor.current!.getJSON()
        const post = {
            title: titleInput.current!.value.toString(),
            content: JSON.stringify(content),
            published: 'true'
        }

        if (!post.title || !post.content) {
            setSuccess(false)
            setError(true)
            setErrorText('Fields "Title" and "Content" can not be empty')
            return
        }

        const res = await fetch(`${API_ENDPOINT}/api/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session.user.backendToken
            },
            body: JSON.stringify(post)
        })

        setIsLoading(false)
        if (res.ok && res.status >= 200 && res.status < 300) {
            setSuccess(true)
            setError(false)
            setTimeout(() => window.location.href = '/', 1000)
        }
        else {
            const error = res.status < 500 ? (await res.json()).message : 'An error occurred while creating the post, please try again later'
            setSuccess(false)
            setError(true)
            setErrorText(error)
        }
    }

    return (
        <>
            <form onSubmit={ submit } ref={ formRef }>
                <TextInput width="100%" name="title" placeholder="Title" ref={ titleInput } /><br /><br />
                <Label className="form-label" htmlFor="content" marginBottom={4} display="block">
                    Content
                </Label>
                <TipTap ref={ editor } />
                { success &&
                    <InlineAlert intent="success" marginTop={16}>
                        A post has been successfully created
                    </InlineAlert>
                }
                { error &&
                    <InlineAlert intent="danger" marginTop={16}>
                        { errorText || 'An error occurred while creating the post. Please try again later' }
                    </InlineAlert>
                }
                <br />
                <Button appearance='primary' isLoading={ isLoading } onClick={ createPost }>Create</Button>
            </form>
        </>
    )
}
