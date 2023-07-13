'use client'

import { FormEvent, useRef, useState } from 'react'
import { Dialog, TextInput, Button, Textarea, Label, Alert } from 'evergreen-ui'
import { API_ENDPOINT } from '@/config'

export default function CreateForm() {
	const [isShown, setIsShown] = useState(false)
	const [success, setSuccess] = useState(false)
	const [errorText, setErrorText] = useState('')
	const [error, setError] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)

    const openDialog = () => {
        setIsShown(true)
    }

	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const data = new FormData(e.target as HTMLFormElement)
		const post = {
			title: data.get('title')!.toString(),
			content: data.get('content')!.toString(),
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
            if (formRef.current) formRef.current.reset()
            setTimeout(() => window.location.href = window.location.href, 1000)
		}
		else {
			setSuccess(false)
			setError(true)
            setErrorText(response.error)
		}
	}

	return (
		<>
			<Dialog
				isShown={ isShown }
				title="Create a new post"
				onConfirm={ () => formRef.current ? formRef.current.requestSubmit() : null }
				onCloseComplete={ () => setIsShown(false) }
				confirmLabel="Create"
			>
				<form onSubmit={ submit } ref={ formRef }>
					<TextInput width="100%" name="title" placeholder="Title" /><br /><br />
					<Label htmlFor="content" marginBottom={4} display="block">
					    Content
					</Label>
					<Textarea id="content" name="content" placeholder="Post content" />
				</form>
				{ success &&
					<Alert
						intent="success"
						title="A post has been successfully created"
						marginTop={16}
					/>
				}
				{ error &&
					<Alert
						intent="danger"
						title={ errorText || 'An error occurred while creating the post. Please try again later' }
						marginTop={16}
					/>
				}
			</Dialog>

			<Button appearance='primary' onClick={ openDialog }>New post</Button>
		</>
	)
}
