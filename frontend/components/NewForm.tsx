'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Button, InlineAlert } from 'evergreen-ui'
import TipTap from './TipTap'
import { callAPI } from '@/util'
import { HTTP_METHOD } from 'next/dist/server/web/http'

interface Editor {
    getJSON: () => string 
}

interface Props {
    token?: string
}

export default function NewForm({ token }: Props) {
    const [ success, setSuccess ] = useState(false)
    const [ errorText, setErrorText ] = useState('')
    const [ error, setError ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const editor = useRef<Editor | null>(null)
    const formRef = useRef<HTMLFormElement>(null)
    const titleInput = useRef<HTMLInputElement>(null)

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
            setIsLoading(false)
            return
        }

        try {
            const options = {
                method: 'POST' as HTTP_METHOD,
                payload: post,
                token
            }
            await callAPI('/api/post', options)
            setSuccess(true)
            setError(false)
            setTimeout(() => window.location.href = '/', 1000)
        }
        catch (e) {
            const error = (e as Error).message
            console.error(error)
            setErrorText(error)
            setSuccess(false)
            setError(true)
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => titleInput.current!.focus())

    return (
        <>
            <form onSubmit={ submit } ref={ formRef }>
                <input className='post-title' name="title" placeholder='Create a new post' ref={ titleInput } />
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
                <Button appearance='primary' isLoading={ isLoading } type="submit">Publish</Button>
            </form>
        </>
    )
}
