'use client'

import { FormEvent, useRef, useState } from 'react'
import { TextInput, Button, Label, InlineAlert } from 'evergreen-ui'
import { API_ENDPOINT } from '@/config'
import TipTap from './TipTap'

interface Editor {
    getJSON: () => string 
}

export default function NewForm() {
	const [success, setSuccess] = useState(false)
	const [errorText, setErrorText] = useState('')
	const [error, setError] = useState(false)
    const editor = useRef<Editor | null>(null)
	const formRef = useRef<HTMLFormElement>(null)
    const titleInput = useRef<HTMLInputElement>(null)

    const createPost = () => formRef.current?.requestSubmit()

	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
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
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(post)
		})
        const response = await res.json()

		if (res.ok) {
            setSuccess(true)
            setError(false)
            setTimeout(() => window.location.href = '/', 1000)
		}
		else {
			setSuccess(false)
			setError(true)
            setErrorText(response.error)
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
            </form>
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
            <Button appearance='primary' onClick={ createPost }>Create</Button>
        </>
    )
}
