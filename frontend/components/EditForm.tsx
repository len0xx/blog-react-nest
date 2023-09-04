'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, toaster } from 'evergreen-ui'
import TipTap from './TipTap'
import Form, { FormRef } from './Form'
import { Post } from '@/util'

interface Editor {
    getJSON: () => any
    getText: () => string
}

interface Props {
    post: Post
    token?: string
}

export default function EditForm({ post, token }: Props) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ disabled, setDisabled ] = useState(false)
    const [ mounted, setMounted ] = useState(false)
    const editor = useRef<Editor | null>(null)
    const formRef = useRef<FormRef>(null)
    const titleInput = useRef<HTMLInputElement>(null)
    const [ title, setTitle ] = useState('')
    const [ content, setContent ] = useState('')

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
            published: true
        }
    }

    const trySubmit = () => {
        if (disabled) {
            toaster.danger('You can not save this post', { description: 'Because either "Title" or "Content" field is empty' })
        }
    }

    useEffect(() => {
        if (!mounted) {
            titleInput.current!.focus()
            setMounted(true)
        }
    })

    return (
        <>
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
        </>
    )
}
