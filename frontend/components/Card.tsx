'use client'

import { Button, Dialog } from 'evergreen-ui'
import Content from './Content'
import '@/app/styles/card.css'
import { useState } from 'react'
import { callAPI } from '@/util'
import { toaster } from 'evergreen-ui'

interface CardProps {
    title: string
    text: string
    id: number
    token?: string
    editable?: boolean
    children?: React.ReactNode
    onDelete?: (id: number) => void
}

export default function CardComponent({ title, text, id, editable = false, token, onDelete }: CardProps) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isDialogShown, setShown ] = useState(false)

    const deletePost = async () => {
        let response: any = null

        try {
            setIsLoading(true)
            response = await callAPI(`/api/post/${ id }`, { method: 'DELETE', token })
        }
        catch (e) {
            console.error(`The post with id ${ id } was not deleted`)
            toaster.danger('The post was not deleted due to an unexpected error', { description: 'Please try again later' })
        }
        finally {
            setIsLoading(false)
            if (response) {
                if (onDelete) onDelete(id)
                toaster.success('The post has successfully been deleted')
            }
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
