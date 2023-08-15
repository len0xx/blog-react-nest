'use client'

import { Button, Dialog } from 'evergreen-ui'
import Content from './Content'
import '@/app/styles/card.css'
import { API_ENDPOINT } from '@/config'
import { useState } from 'react'

interface CardProps {
    title: string
    text: string
    id: number
    token?: string
    editable?: boolean
    children?: React.ReactNode
    onDelete?: (id: number) => void
}

export default function CardComponent({ title, text, id, editable = false, token = undefined, onDelete = undefined }: CardProps) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isDialogShown, setShown ] = useState(false)

    const deletePost = async () => {
        setIsLoading(true)
        const options = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': token! }
        }
        const res = await fetch(`${ API_ENDPOINT }/api/post/${ id }`, options)
        setIsLoading(false)

        if (res.ok && onDelete) {
            onDelete(id)
        }
    }

    const closeDialog = () => {
        setShown(false)
        deletePost()
    }

    return (
        <>
            <Dialog
                isShown={ isDialogShown }
                title="Are you sure you want to delete this post?"
                onCloseComplete={ closeDialog }
                confirmLabel="Delete"
                minHeightContent={ 0 }
            >
                Confirm your action
            </Dialog>
            <div className="card">
                <div className="card-title">
                    { title }
                </div>
                <div className="card-content">
                    <div className="card-text">
                        <Content content={ text } />
                    </div>	
                    <div className='card-footer'>
                        <a href={ `/post/${ id }` }>
                            <Button size="small" appearance="default" marginRight={ 10 }>
                                Open
                            </Button>
                        </a>
                        { editable && 
                            <Button
                                size="small"
                                appearance="default"
                                intent='danger'
                                marginRight={ 10 }
                                onClick={ () => setShown(true) }
                                isLoading={ isLoading }
                            >
                                Delete
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
