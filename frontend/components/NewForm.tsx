'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, toaster } from 'evergreen-ui'
import TipTap from './TipTap'
import Form, { FormRef } from './Form'

interface Editor {
    getJSON: () => any
    getText: () => string
}

interface Props {
    token?: string
}

export default function NewForm({ token }: Props) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ disabled, setDisabled ] = useState(true)
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
            toaster.danger('You can not publish this post', { description: 'Because either "Title" or "Content" field is empty' })
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
                action="/api/post"
                method="POST"
                details={ details }
                displayMsg
                successMessage="A post has been successfully created"
                errorMessage="An error occurred while creating the post. Please try again later"
                onLoadingUpdate={ setIsLoading }
                onSuccess={ () => { setTimeout(() => window.location.href = '/', 1000) } }
                ref={ formRef }
            >
                <input className='post-title' name="title" placeholder='Create a new post' ref={ titleInput } onChange={ inputUpdated } />
                <TipTap onUpdate={ inputUpdated } ref={ editor } />
            </Form>
            <br />
            <span onClick={ trySubmit }>
                <Button
                    type="button"
                    appearance='primary'
                    onClick={ () => formRef.current!.requestSubmit() }
                    isLoading={ isLoading }
                    disabled={ disabled }
                >
                    Publish
                </Button>
            </span>
        </>
    )
}
